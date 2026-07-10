const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');
const logger = require('../../../../common/src/utils/logger');

async function enrichOrders(orders) {
  if (!orders || !orders.length) return orders || [];

  const allProductIds = [...new Set(orders.flatMap(o => (o.order_items || []).map(i => i.product_id)))];
  const addressIds = orders.filter(o => o.shipping_address_id).map(o => o.shipping_address_id);

  let productMap = {};
  if (allProductIds.length > 0) {
    const { data: products } = await supabase.from('products').select('id, name').in('id', allProductIds);
    for (const p of products || []) productMap[p.id] = p.name;
  }

  let addressMap = {};
  if (addressIds.length > 0) {
    const { data: addresses } = await supabase.from('addresses').select('*').in('id', addressIds);
    for (const a of addresses || []) addressMap[a.id] = a;
  }

  return orders.map(o => ({
    ...o,
    order_items: (o.order_items || []).map(i => ({ ...i, product_name: productMap[i.product_id] || 'Producto' })),
    shipping_address: addressMap[o.shipping_address_id] || null,
  }));
}

const getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    let countQuery = supabase
      .from('orders')
      .select('*', { count: 'exact', head: true });

    let dataQuery = supabase
      .from('orders')
      .select('*, order_items(*), profiles!inner(name, email)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const isAdmin = req.user && req.user.role === 'admin';
    const userId = !isAdmin ? (req.user ? req.user.id : 'none') : (req.query.user_id || null);

    if (userId) {
      countQuery = countQuery.eq('user_id', userId);
      dataQuery = dataQuery.eq('user_id', userId);
    }
    if (req.query.status) {
      countQuery = countQuery.eq('status', req.query.status);
      dataQuery = dataQuery.eq('status', req.query.status);
    }

    const [{ count }, { data: orders, error }] = await Promise.all([
      countQuery,
      dataQuery,
    ]);

    if (error) throw error;
    const enriched = await enrichOrders(orders);
    successResponse(res, {
      orders: enriched,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*), profiles!inner(name, email)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!order) return errorResponse(res, 'Orden no encontrada', 404);

    const isAdmin = req.user && req.user.role === 'admin';
    if (!isAdmin && req.user && order.user_id !== req.user.id) {
      return errorResponse(res, 'Acceso denegado', 403);
    }

    const enriched = await enrichOrders([order]);
    successResponse(res, enriched[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { user_id, items, shipping_address_id, notes, shipping_address, needs_invoice, invoice_rfc, invoice_business_name, invoice_email, invoice_cfdi_use, invoice_zip, invoice_regime } = req.body;

    if (!user_id) {
      return errorResponse(res, 'user_id es requerido', 400);
    }
    if (!items || !items.length) {
      return errorResponse(res, 'items es requerido (array con al menos un producto)', 400);
    }

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity < 1) {
        return errorResponse(res, 'Cada item debe tener product_id y quantity > 0', 400);
      }
    }

    const productIds = items.map(i => i.product_id);
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, price, stock, status')
      .in('id', productIds);

    if (prodError) {
      logger.error('Error al consultar productos', { error: prodError.message });
      throw prodError;
    }

    const productMap = {};
    for (const p of products || []) {
      productMap[p.id] = p;
    }

    for (const item of items) {
      const product = productMap[item.product_id];
      if (!product) {
        return errorResponse(res, `Producto ID ${item.product_id} no encontrado`, 400);
      }
      if (product.status === 'inactive') {
        return errorResponse(res, `Producto ID ${item.product_id} no está disponible`, 400);
      }
      if (product.stock < item.quantity) {
        return errorResponse(res, `Stock insuficiente para el producto ID ${item.product_id}`, 400);
      }
    }

    const IVA = 0.16;
    const orderItems = items.map(item => {
      const unitPrice = productMap[item.product_id].price;
      return {
        product_id: item.product_id,
        quantity: item.quantity,
        unit_price: Math.round(unitPrice * (1 + IVA) * 100) / 100,
      };
    });

    const total = Math.round(orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0) * 100) / 100;

    let finalShippingAddressId = shipping_address_id;

    if (shipping_address && !finalShippingAddressId) {
      if (!shipping_address.street || !shipping_address.city || !shipping_address.zip) {
        return errorResponse(res, 'Dirección de envío requiere street, city y zip', 400);
      }

      const { data: addr, error: addrError } = await supabase
        .from('addresses')
        .insert({
          user_id,
          company_name: shipping_address.company || null,
          contact_name: shipping_address.contact || null,
          street: shipping_address.street,
          city: shipping_address.city,
          state: shipping_address.state || 'N/A',
          zip: shipping_address.zip,
          country: shipping_address.country || 'México',
        })
        .select('id')
        .single();

      if (addrError) {
        logger.error('Error al crear dirección', { error: addrError.message });
        return errorResponse(res, 'Error al guardar la dirección de envío', 400);
      }
      finalShippingAddressId = addr.id;
    }

    const invoiceData = {};
    if (needs_invoice) {
      invoiceData.needs_invoice = true;
      if (invoice_rfc) invoiceData.invoice_rfc = invoice_rfc;
      if (invoice_business_name) invoiceData.invoice_business_name = invoice_business_name;
      if (invoice_email) invoiceData.invoice_email = invoice_email;
      if (invoice_cfdi_use) invoiceData.invoice_cfdi_use = invoice_cfdi_use;
      if (invoice_zip) invoiceData.invoice_zip = invoice_zip;
      if (invoice_regime) invoiceData.invoice_regime = invoice_regime;
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({ user_id, total, shipping_address_id: finalShippingAddressId, notes, ...invoiceData })
      .select('id, user_id, total, status, notes, created_at')
      .single();

    if (orderError) {
      logger.error('Error al crear orden', { error: orderError.message });
      return errorResponse(res, 'Error al crear la orden', 500);
    }

    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) {
      logger.error('Error al insertar items de orden', { error: itemsError.message, order_id: order.id });
      await supabase.from('orders').delete().eq('id', order.id);
      return errorResponse(res, 'Error al guardar los items de la orden', 500);
    }

    let { data: fullOrder } = await supabase
      .from('orders')
      .select('*, order_items(*), profiles!inner(name, email)')
      .eq('id', order.id)
      .single();

    const enriched = await enrichOrders([fullOrder]);
    fullOrder = enriched[0];

    successResponse(res, fullOrder, 'Orden creada', 201);
  } catch (err) {
    next(err);
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return errorResponse(res, `Estado inválido. Valores: ${validStatuses.join(', ')}`, 400);
    }

    let { data: order, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*, order_items(*), profiles!inner(name, email)')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return errorResponse(res, 'Orden no encontrada', 404);
      throw error;
    }

    const enriched = await enrichOrders([order]);
    order = enriched[0];
    successResponse(res, order, 'Estado de orden actualizado');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, updateStatus };
