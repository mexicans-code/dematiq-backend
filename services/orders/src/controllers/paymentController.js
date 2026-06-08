const { MercadoPagoConfig, Preference, Payment, MerchantOrder } = require('mercadopago');
const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
});

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3000';

const createPreference = async (req, res, next) => {
  try {
    const { order_id } = req.body;

    if (!order_id) {
      return errorResponse(res, 'order_id es requerido', 400);
    }

    const { data: order, error } = await supabase
      .from('orders')
      .select('*, order_items(*), profiles!inner(name, email)')
      .eq('id', order_id)
      .single();

    if (error || !order) {
      return errorResponse(res, 'Orden no encontrada', 404);
    }

    const items = order.order_items.map((item) => ({
      id: String(item.product_id),
      title: `Producto #${item.product_id}`,
      description: `Cantidad: ${item.quantity}`,
      quantity: Number(item.quantity),
      unit_price: Number(item.unit_price),
      currency_id: 'MXN',
    }));

    const body = {
      items,
      external_reference: String(order.id),
      notification_url: `${BACKEND_URL}/api/payments/webhook`,
      back_urls: {
        success: `${FRONTEND_URL}/pago-exitoso?order_id=${order.id}`,
        failure: `${FRONTEND_URL}/carrito`,
        pending: `${FRONTEND_URL}/carrito`,
      },
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

    const isSandbox = process.env.MERCADO_PAGO_SANDBOX === 'true';
    successResponse(res, {
      init_point: isSandbox ? result.sandbox_init_point : result.init_point,
      preference_id: result.id,
    });
  } catch (err) {
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
    }

    res.sendStatus(200);
  } catch (err) {
    next(err);
  }
};

module.exports = { createPreference, verifyPayment, webhook };
