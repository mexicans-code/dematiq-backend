const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

const getAll = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(200, Math.max(1, parseInt(req.query.limit) || 50));
    const offset = (page - 1) * limit;

    let countQuery = supabase
      .from('products')
      .select('*', { count: 'exact', head: true });

    let dataQuery = supabase
      .from('products')
      .select('*, categories(name), brands(name, logo_url)')
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (req.query.status) {
      countQuery = countQuery.eq('status', req.query.status);
      dataQuery = dataQuery.eq('status', req.query.status);
    }

    if (req.query.category_id) {
      countQuery = countQuery.eq('category_id', req.query.category_id);
      dataQuery = dataQuery.eq('category_id', req.query.category_id);
    }
    if (req.query.search) {
      const filter = `name.ilike.%${req.query.search}%,sku.ilike.%${req.query.search}%`;
      countQuery = countQuery.or(filter);
      dataQuery = dataQuery.or(filter);
    }

    const [{ count }, { data: products, error }] = await Promise.all([
      countQuery,
      dataQuery,
    ]);

    if (error) throw error;
    successResponse(res, {
      products: products || [],
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
    const { data: product, error } = await supabase
      .from('products')
      .select('*, categories(name), brands(name, logo_url)')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!product) return errorResponse(res, 'Producto no encontrado', 404);

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && product.status === 'inactive') {
      return errorResponse(res, 'Producto no disponible', 404);
    }

    successResponse(res, product);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, sku, category_id, brand_id, price, stock, image_url, specs, price_on_request } = req.body;

    if (!name || !sku) {
      return errorResponse(res, 'Nombre y SKU son requeridos', 400);
    }

    if (!price_on_request && (price === undefined || price === null || price === '')) {
      return errorResponse(res, 'Precio es requerido si el producto no es "sin precio"', 400);
    }

    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

    const { data: product, error } = await supabase
      .from('products')
      .insert({
        name, slug, description, sku, category_id, brand_id,
        price: price_on_request ? 0 : price,
        stock: stock || 0, image_url, specs: specs || {},
        price_on_request: price_on_request || false
      })
      .select('*, categories(name), brands(name, logo_url)')
      .single();

    if (error) throw error;
    successResponse(res, product, 'Producto creado', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, description, sku, category_id, brand_id, price, stock, image_url, specs, status, price_on_request } = req.body;
    const updates = {};
    if (name) { updates.name = name; updates.slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''); }
    if (description !== undefined) updates.description = description;
    if (sku) updates.sku = sku;
    if (category_id !== undefined) updates.category_id = category_id;
    if (brand_id !== undefined) updates.brand_id = brand_id;
    if (price_on_request !== undefined) updates.price_on_request = price_on_request;
    if (price !== undefined && price !== null && price !== '') updates.price = price;
    if (stock !== undefined) updates.stock = stock;
    if (image_url !== undefined) updates.image_url = image_url;
    if (specs) updates.specs = specs;
    if (status) updates.status = status;
    updates.updated_at = new Date().toISOString();

    const { data: product, error } = await supabase
      .from('products')
      .update(updates)
      .eq('id', req.params.id)
      .select('*, categories(name), brands(name, logo_url)')
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
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;
    successResponse(res, null, 'Producto deshabilitado');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, delete: _delete };
