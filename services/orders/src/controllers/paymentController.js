const { MercadoPagoConfig, Preference, Payment, MerchantOrder, PaymentRefund } = require('mercadopago');
const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const decrementStock = async (orderId) => {
  const { data: orderItems, error } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId);

  if (error || !orderItems) return;

  for (const item of orderItems) {
    const { data: product } = await supabase
      .from('products')
      .select('stock')
      .eq('id', item.product_id)
      .single();

    if (product) {
      await supabase
        .from('products')
        .update({ stock: Math.max(0, product.stock - item.quantity) })
        .eq('id', item.product_id);
    }
  }
};

const createPreference = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return errorResponse(res, 'order_id es requerido', 400);
    }

    if (!process.env.MERCADO_PAGO_ACCESS_TOKEN) {
      return errorResponse(res, 'MERCADO_PAGO_ACCESS_TOKEN no configurado en el servidor', 500);
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*), profiles(name, email)')
      .eq('id', order_id)
      .single();

    if (error || !order) {
      return errorResponse(res, 'Orden no encontrada', 404);
    }

    if (!order.order_items?.length) {
      return errorResponse(res, 'La orden no tiene productos. Crea el pedido nuevamente.', 400);
    }

    const productIds = order.order_items.map(i => i.product_id);
    const { data: products } = await supabase
      .from('products')
      .select('id, name')
      .in('id', productIds);

    const productNames = {};
    if (products) {
      for (const p of products) {
        productNames[p.id] = p.name;
      }
    }

    const IVA = 0.16;
    const items = order.order_items.map((item) => ({
      id: String(item.product_id),
      title: productNames[item.product_id] || `Producto #${item.product_id}`,
      description: `Cantidad: ${item.quantity}`,
      quantity: Number(item.quantity),
      unit_price: Math.round(Number(item.unit_price) * (1 + IVA) * 100) / 100,
      currency_id: 'MXN',
    }));

    const body = {
      items,
      external_reference: String(order.id),
      back_urls: {
        success: `${FRONTEND_URL}/pago-exitoso?order_id=${order.id}`,
        failure: `${FRONTEND_URL}/carrito`,
        pending: `${FRONTEND_URL}/pago-exitoso?order_id=${order.id}`,
      },
      auto_return: 'approved',
      notification_url: `${BACKEND_URL}/api/payments/webhook`,
      payer: {
        email: order.profiles?.email || 'comprador@email.com',
        name: order.profiles?.name || 'Comprador',
      },
    };

    const result = await new Preference(client).create({ body });

    await supabase
      .from('orders')
      .update({
        mp_order_id: result.id,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id);

    const isTestToken = process.env.MERCADO_PAGO_ACCESS_TOKEN.startsWith('TEST-');

    return successResponse(res, {
      init_point: isTestToken ? (result.sandbox_init_point || result.init_point) : result.init_point,
      preference_id: result.id,
    });
  } catch (err) {
    const mpMessage = err.cause?.[0]?.description || err.message;
    console.error('[Mercado Pago]', mpMessage, err.cause || '');
    err.statusCode = err.statusCode || 502;
    err.message = mpMessage || 'Error al crear la preferencia de pago';
    next(err);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { payment_id, order_id } = req.body;

    if (!payment_id) {
      return errorResponse(res, 'payment_id es requerido', 400);
    }

    const payment = await new Payment(client).get({ id: payment_id });
    const { status, external_reference } = payment;

    if (status === 'approved') {
      const targetOrder = external_reference || order_id;
      if (targetOrder) {
        await supabase
          .from('orders')
          .update({ status: 'confirmed', updated_at: new Date().toISOString() })
          .eq('id', targetOrder);
        await decrementStock(targetOrder);
      }
      return successResponse(res, { status: 'approved' }, 'Pago confirmado');
    }

    successResponse(res, { status }, 'Estado del pago');
  } catch (err) {
    next(err);
  }
};

const webhook = async (req, res, next) => {
  try {
    const getPaymentId = async (body) => {
      if (body.type === 'payment' && body.data?.id) return body.data.id;
      if (body.topic === 'payment' && body.id) return body.id;
      if (body.topic === 'merchant_order' && body.id) {
        const order = await new MerchantOrder(client).get({ merchantOrderId: body.id });
        return order.payments?.[0]?.id || null;
      }
      return null;
    };

    const paymentId = await getPaymentId(req.body);
    if (!paymentId) return res.sendStatus(200);

    const payment = await new Payment(client).get({ id: paymentId });
    const { status, external_reference } = payment;

    if (status === 'approved' && external_reference) {
      await supabase
        .from('orders')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', external_reference);
      await decrementStock(external_reference);
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

const reverifyPayment = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return errorResponse(res, 'order_id es requerido', 400);
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('mp_order_id, status')
      .eq('id', order_id)
      .single();

    if (error || !order) {
      return errorResponse(res, 'Orden no encontrada', 404);
    }

    if (!order.mp_order_id) {
      return errorResponse(res, 'Esta orden no tiene referencia de pago de Mercado Pago', 400);
    }

    const response = await fetch(
      `https://api.mercadopago.com/v1/payments/search?external_reference=${order_id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
        },
      }
    );
    const result = await response.json();

    if (!result.results || result.results.length === 0) {
      return errorResponse(res, 'No se encontraron pagos en Mercado Pago para esta orden', 404);
    }

    const payment = result.results[0];
    const { status, id: payment_id } = payment;

    if (status === 'approved') {
      await supabase
        .from('orders')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', order_id);
      await decrementStock(order_id);

      return successResponse(res, { status: 'approved', payment_id }, 'Pago confirmado');
    }

    successResponse(res, { status, payment_id }, 'Estado del pago en Mercado Pago');
  } catch (err) {
    next(err);
  }
};

const processCardPayment = async (req, res, next) => {
  try {
    const { order_id, card_token, installments, payer_email } = req.body;

    if (!order_id || !card_token) {
      return errorResponse(res, 'order_id y card_token son requeridos', 400);
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*)')
      .eq('id', order_id)
      .single();

    if (error || !order) {
      return errorResponse(res, 'Orden no encontrada', 404);
    }

    if (order.status !== 'pending') {
      return errorResponse(res, 'La orden ya fue procesada', 400);
    }

    const paymentData = {
      transaction_amount: Number(order.total),
      token: card_token,
      description: `Orden #${order.id}`,
      installments: Number(installments) || 1,
      payer: {
        email: payer_email,
      },
    };

    const payment = await new Payment(client).create({ body: paymentData });

    if (payment.status === 'approved') {
      await supabase
        .from('orders')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', order.id);

      for (const item of order.order_items) {
        const { data: product } = await supabase
          .from('products')
          .select('stock')
          .eq('id', item.product_id)
          .single();

        await supabase
          .from('products')
          .update({ stock: product.stock - item.quantity })
          .eq('id', item.product_id);
      }

      return successResponse(res, { status: 'approved', payment_id: payment.id }, 'Pago aprobado');
    }

    successResponse(res, { status: payment.status, payment_id: payment.id }, 'Estado del pago');
  } catch (err) {
    if (err.cause && err.cause[0]?.error === 'invalid_card_token') {
      return errorResponse(res, 'Token de tarjeta inválido', 400);
    }
    next(err);
  }
};

module.exports = { createPreference, verifyPayment, webhook, reverifyPayment, processCardPayment };
