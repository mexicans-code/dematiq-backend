const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

const getAll = async (req, res, next) => {
  try {
    let query = supabase
      .from('products')
      .select('*, categories(name)');

    if (req.query.category_id) {
      query = query.eq('category_id', req.query.category_id);
    }
    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    const { data: products, error } = await query;

    if (error) throw error;
    successResponse(res, products || []);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(name)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!product) return errorResponse(res, 'Producto no encontrado', 404);

    successResponse(res, product);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, sku, category_id, price, stock, image_url, specs } = req.body;

    if (!name || !sku || !price) {
      return errorResponse(res, 'Nombre, SKU y precio son requeridos', 400);
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name, slug, description, sku, category_id,
        price, stock: stock || 0, image_url, specs: specs || {}
      })
      .select('*, categories(name)')
      .single();

    if (error) throw error;
    successResponse(res, product, 'Producto creado', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, description, sku, category_id, price, stock, image_url, specs, status } = req.body;
    const updates = {};
    if (name) { updates.name = name; updates.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
    if (description !== undefined) updates.description = description;
    if (sku) updates.sku = sku;
    if (category_id) updates.category_id = category_id;
    if (price) updates.price = price;
    if (stock !== undefined) updates.stock = stock;
    if (image_url !== undefined) updates.image_url = image_url;
    if (specs) updates.specs = specs;
    if (status) updates.status = status;
    updates.updated_at = new Date().toISOString();

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, categories(name)')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return errorResponse(res, 'Producto no encontrado', 404);
      throw error;
    }

    successResponse(res, product, 'Producto actualizado');
  } catch (err) {
    next(err);
  }
};

const _delete = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;
    successResponse(res, null, 'Producto eliminado');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, delete: _delete };
