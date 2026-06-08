const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

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
    successResponse(res, orders || []);
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

    successResponse(res, order);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { user_id, items, shipping_address_id, notes } = req.body;

    if (!user_id || !items || !items.length) {
      return errorResponse(res, 'user_id y items son requeridos', 400);
    }

    const productIds = items.map(i => i.product_id);
    const { data: products, error: prodError } = await supabase
      .from('products')
      .select('id, price')
      .in('id', productIds);

    if (prodError) throw prodError;

    const productMap = {};
    for (const p of products) {
      productMap[p.id] = p.price;
    }

    const orderItems = items.map(item => ({
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: productMap[item.product_id] || item.price,
    }));

    const total = orderItems.reduce((sum, item) => sum + item.unit_price * item.quantity, 0);

    const { data: order, error } = await supabase
      .from('orders')
      .insert({ user_id, total, shipping_address_id, notes })
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

    const { data: fullOrder } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order.id)
      .single();

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

    const { data: order, error } = await supabase
      .from('orders')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .select('*, order_items(*)')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return errorResponse(res, 'Orden no encontrada', 404);
      throw error;
    }

    successResponse(res, order, 'Estado de orden actualizado');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, updateStatus };
