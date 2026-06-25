const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

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
    let query = supabase
      .from('orders')
      .select('*, order_items(*), profiles!inner(name, email)');

    if (req.query.user_id) {
      query = query.eq('user_id', req.query.user_id);
    }
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    const { data: orders, error } = await query;

    if (error) throw error;
    const enriched = await enrichOrders(orders);
    successResponse(res, enriched);
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

    const enriched = await enrichOrders([order]);
    successResponse(res, enriched[0]);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { user_id, items, shipping_address_id, notes, shipping_address } = req.body;

    if (!user_id || !items || !items.length) {
      return errorResponse(res, 'user_id y items son requeridos', 400);
    }

    const productIds = items.map(i => i.product_id);
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, price, stock')
      .in('id', productIds);

    if (prodError) throw prodError;

    const productMap = {};
    for (const p of products) {
      productMap[p.id] = p;
    }

    for (const item of items) {
      const product = productMap[item.product_id];
      if (!product) {
        return errorResponse(res, `Producto ID ${item.product_id} no encontrado`, 400);
      }
      if (product.stock < item.quantity) {
        return errorResponse(res, `Stock insuficiente para el producto ID ${item.product_id}`, 400);
      }
    }

    const IVA = 0.16;
    const orderItems = items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: productMap[item.product_id].price,
    }));

    const subtotal = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);
    const total = Math.round(subtotal * (1 + IVA) * 100) / 100;

    let finalShippingAddressId = shipping_address_id;

    if (shipping_address && !finalShippingAddressId) {
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

      if (addrError) throw addrError;
      finalShippingAddressId = addr.id;
    }

    const { data: order, error } = await supabase
      .from('orders')
      .insert({ user_id, total, shipping_address_id: finalShippingAddressId, notes })
      .select('id, user_id, total, status, notes, created_at')
      .single();

    if (error) throw error;

    const itemsWithOrderId = orderItems.map((item) => ({
      ...item,
      order_id: order.id,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(itemsWithOrderId);

    if (itemsError) throw itemsError;

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
