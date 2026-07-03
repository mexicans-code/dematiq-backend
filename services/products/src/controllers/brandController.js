const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

function slugify(name) {
  return name.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const getAll = async (req, res, next) => {
  try {
    let query = supabase
      .from('brands')
      .select('*')
      .order('name');

    const isAdmin = req.user?.role === 'admin';

    if (!req.query.status) {
      if (!isAdmin) {
        query = query.eq('status', 'active');
      }
    } else if (req.query.status === 'all' && isAdmin) {
    } else if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    const { data: brands, error } = await query;

    if (error) throw error;
    successResponse(res, brands || []);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { data: brand, error } = await supabase
      .from('brands')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!brand) return errorResponse(res, 'Marca no encontrada', 404);

    successResponse(res, brand);
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, logo_url, website_url } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, 'El nombre es requerido', 400);
    }

    const slug = slugify(name);

    const { data: existing } = await supabase
      .from('brands')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return errorResponse(res, 'Ya existe una marca con ese nombre', 409);
    }

    const { data: brand, error } = await supabase
      .from('brands')
      .insert({
        name: name.trim(),
        slug,
        description: description || null,
        logo_url: logo_url || null,
        website_url: website_url || null,
      })
      .select('*')
      .single();

    if (error) throw error;
    successResponse(res, brand, 'Marca creada', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, description, logo_url, website_url, status } = req.body;
    const updates = {};

    if (name !== undefined) {
      const slug = slugify(name);
      const { data: existing } = await supabase
        .from('brands')
        .select('id')
        .eq('slug', slug)
        .neq('id', req.params.id)
        .maybeSingle();

      if (existing) {
        return errorResponse(res, 'Ya existe otra marca con ese nombre', 409);
      }
      updates.name = name.trim();
      updates.slug = slug;
    }

    if (description !== undefined) updates.description = description;
    if (logo_url !== undefined) updates.logo_url = logo_url;
    if (website_url !== undefined) updates.website_url = website_url;
    if (status !== undefined) updates.status = status;

    const { data: brand, error } = await supabase
      .from('brands')
      .update(updates)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return errorResponse(res, 'Marca no encontrada', 404);
      throw error;
    }

    successResponse(res, brand, 'Marca actualizada');
  } catch (err) {
    next(err);
  }
};

const _delete = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('brands')
      .update({ status: 'inactive' })
      .eq('id', req.params.id);

    if (error) {
      if (error.code === 'PGRST116') return errorResponse(res, 'Marca no encontrada', 404);
      throw error;
    }

    successResponse(res, null, 'Marca deshabilitada');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, create, update, delete: _delete };
