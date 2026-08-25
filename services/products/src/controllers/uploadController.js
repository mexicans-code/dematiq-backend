const path = require('path');
const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

const BUCKET = 'imagenes-productos';
const SIGNED_URL_EXPIRY = 60 * 60 * 24 * 365; // 1 año

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: false,
    });
    if (error) {
      console.error(`[Upload] Error al crear bucket "${BUCKET}": ${error.message}`);
    } else {
      console.log(`[Upload] Bucket privado "${BUCKET}" creado correctamente`);
    }
  }
}

ensureBucket();

const upload = async (req, res, next) => {
  try {
    if (!req.file) {
      return errorResponse(res, 'No se envió ningún archivo', 400);
    }

    const ext = path.extname(req.file.originalname).toLowerCase();
    const allowed = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.pdf'];
    if (!allowed.includes(ext)) {
      return errorResponse(res, 'Formato no válido. Permitidos: jpg, jpeg, png, gif, webp, svg, pdf', 400);
    }

    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}${ext}`;

    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(fileName, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (error) {
      if (error.message?.includes('Bucket not found')) {
        await ensureBucket();
        const { error: retryError } = await supabase.storage
          .from(BUCKET)
          .upload(fileName, req.file.buffer, {
            contentType: req.file.mimetype,
            upsert: false,
          });
        if (retryError) throw retryError;
      } else {
        throw error;
      }
    }

    const { data: signedUrlData, error: signedError } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(fileName, SIGNED_URL_EXPIRY);

    if (signedError) throw signedError;

    successResponse(res, { url: signedUrlData.signedUrl, expiresAt: new Date(Date.now() + SIGNED_URL_EXPIRY * 1000).toISOString() }, 'Archivo subido correctamente');
  } catch (err) {
    next(err);
  }
};

module.exports = { upload };