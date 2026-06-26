const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

function isDataUrl(str) {
  return typeof str === 'string' && str.startsWith('data:');
}

async function uploadBase64Image(dataUrl) {
  const matches = dataUrl.match(/^data:image\/(\w+);base64,(.+)$/);
  if (!matches) return null;
  const mime = matches[1];
  const ext = mime === 'jpeg' ? 'jpg' : mime;
  const buffer = Buffer.from(matches[2], 'base64');
  const fileName = `quotation-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;

  let { error } = await supabase.storage
    .from('imagenes-productos')
    .upload(fileName, buffer, { contentType: `image/${mime}`, upsert: false });

  if (error && error.message?.includes('Bucket not found')) {
    await supabase.storage.createBucket('imagenes-productos', { public: true }).catch(() => {});
    const retry = await supabase.storage
      .from('imagenes-productos')
      .upload(fileName, buffer, { contentType: `image/${mime}`, upsert: false });
    error = retry.error;
  }

  if (error) { console.error('[Quotation] Upload error:', error.message); return null; }

  await supabase.storage.updateBucket('imagenes-productos', { public: true }).catch(() => {});

  const { data: signedUrlData, error: signError } = await supabase.storage
    .from('imagenes-productos')
    .createSignedUrl(fileName, 31536000);

  if (signError || !signedUrlData) return null;
  return signedUrlData.signedUrl;
}

async function resolveImages(items, customProducts) {
  const resolved = { items: [...(items || [])], customProducts: [...(customProducts || [])] };

  for (const item of resolved.items) {
    if (item.image && isDataUrl(item.image)) {
      item.image = await uploadBase64Image(item.image);
    }
  }

  for (const p of resolved.customProducts) {
    if (p.image && isDataUrl(p.image)) {
      p.image = await uploadBase64Image(p.image);
    }
  }

  return resolved;
}

function buildEmailHtml({ empresa, contacto, telefono, email, notas, items, customProducts }) {
  const itemsHtml = (items || []).map((i) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #eee;vertical-align:middle">
        <img src="${i.image || ''}" alt="${i.name}" style="width:48px;height:48px;object-fit:cover;border-radius:6px" />
      </td>
      <td style="padding:10px;border-bottom:1px solid #eee;vertical-align:middle">${i.name}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;vertical-align:middle">${i.sku || '-'}</td>
      <td style="padding:10px;border-bottom:1px solid #eee;vertical-align:middle;text-align:center">${i.quantity}</td>
    </tr>
  `).join('');

  const customHtml = (customProducts || []).map((p) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #eee;vertical-align:middle">
        ${p.image ? `<img src="${p.image}" alt="${p.name}" style="width:48px;height:48px;object-fit:cover;border-radius:6px" />` : '-'}
      </td>
      <td style="padding:10px;border-bottom:1px solid #eee;vertical-align:middle" colspan="3">${p.name}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:Arial,sans-serif;background:#f5f5f5;padding:20px">
  <table style="max-width:600px;margin:0 auto;background:white;border-radius:12px;overflow:hidden">
    <tr><td style="background:#004B87;padding:24px;text-align:center">
      <h1 style="color:white;margin:0;font-size:20px">Nueva Solicitud de Cotización</h1>
    </td></tr>
    <tr><td style="padding:24px">
      <h2 style="font-size:14px;color:#004B87;text-transform:uppercase;margin:0 0 16px">Datos del contacto</h2>
      <table style="width:100%;border-collapse:collapse">
        <tr><td style="padding:6px 0;color:#666;font-size:13px;width:100px">Empresa</td><td style="padding:6px 0;font-size:13px"><strong>${empresa || '-'}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666;font-size:13px">Contacto</td><td style="padding:6px 0;font-size:13px"><strong>${contacto || '-'}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666;font-size:13px">Teléfono</td><td style="padding:6px 0;font-size:13px"><strong>${telefono || '-'}</strong></td></tr>
        <tr><td style="padding:6px 0;color:#666;font-size:13px">Email</td><td style="padding:6px 0;font-size:13px"><strong>${email || '-'}</strong></td></tr>
      </table>
      ${notas ? `<h2 style="font-size:14px;color:#004B87;text-transform:uppercase;margin:24px 0 8px">Notas</h2><p style="font-size:13px;color:#333;margin:0">${notas}</p>` : ''}

      ${itemsHtml ? `
        <h2 style="font-size:14px;color:#004B87;text-transform:uppercase;margin:24px 0 8px">Productos del catálogo</h2>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:#f9f9f9">
            <th style="padding:10px;text-align:left;font-size:12px;color:#666">Imagen</th>
            <th style="padding:10px;text-align:left;font-size:12px;color:#666">Producto</th>
            <th style="padding:10px;text-align:left;font-size:12px;color:#666">SKU</th>
            <th style="padding:10px;text-align:center;font-size:12px;color:#666">Cant.</th>
          </tr></thead>
          <tbody>${itemsHtml}</tbody>
        </table>
      ` : ''}

      ${customHtml ? `
        <h2 style="font-size:14px;color:#004B87;text-transform:uppercase;margin:24px 0 8px">Productos personalizados</h2>
        <table style="width:100%;border-collapse:collapse">
          <thead><tr style="background:#f9f9f9">
            <th style="padding:10px;text-align:left;font-size:12px;color:#666">Imagen</th>
            <th style="padding:10px;text-align:left;font-size:12px;color:#666" colspan="3">Producto</th>
          </tr></thead>
          <tbody>${customHtml}</tbody>
        </table>
      ` : ''}
    </td></tr>
    <tr><td style="background:#f9f9f9;padding:16px;text-align:center;font-size:11px;color:#999">
      Dematiq - Solicitud de cotización generada desde el sitio web
    </td></tr>
  </table>
</body>
</html>`;
}

const send = async (req, res, next) => {
  try {
    const { empresa, contacto, telefono, email, notas, items, customProducts } = req.body;

    if (!email) {
      return errorResponse(res, 'El email del contacto es requerido', 400);
    }

    const { items: resolvedItems, customProducts: resolvedCustom } = await resolveImages(items, customProducts);

    if (!process.env.EMAIL_API_KEY) {
      return errorResponse(res, 'Error de configuración del servicio de correo', 500);
    }

    const emailHtml = buildEmailHtml({ empresa, contacto, telefono, email, notas, items: resolvedItems, customProducts: resolvedCustom });
    const fromEmail = process.env.EMAIL_FROM || process.env.EMAIL_API_KEY.startsWith('re_') ? 'onboarding@resend.dev' : 'noreply@dematiq.com';

    const emailRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.EMAIL_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: `"${empresa || 'Solicitud Cotización'}" <${fromEmail}>`,
        to: process.env.QUOTATION_EMAIL || (process.env.EMAIL_API_KEY.startsWith('re_') ? 'delivered@resend.dev' : 'admin@dematiq.com'),
        reply_to: email,
        subject: `Cotización - ${empresa || contacto || 'Nueva solicitud'}`,
        html: emailHtml,
      }),
    });

    if (!emailRes.ok) {
      const errBody = await emailRes.text();
      throw new Error(`Email API error: ${emailRes.status} ${errBody}`);
    }

    successResponse(res, null, 'Cotización enviada correctamente');
  } catch (err) {
    next(err);
  }
};

module.exports = { send };
