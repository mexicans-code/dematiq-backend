const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

function slugify(name) {
  return name.toLowerCase()
    .replace(/[^a-z0-9áéíóúüñ\s-]/g, '')
    .replace(/[áéíóúüñ]/g, (c) => ({ á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u', ü: 'u', ñ: 'ñ' })[c] || c)
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const getAll = async (req, res, next) => {
  try {
    let query = supabase
      .from('categories')
      .select('*')
      .order('name');

    if (req.query.status) {
      query = query.eq('status', req.query.status);
    }

    if (req.query.parent_id === 'null') {
      query = query.is('parent_id', null);
    } else if (req.query.parent_id) {
      query = query.eq('parent_id', req.query.parent_id);
    }

    const { data: categories, error } = await query;

    if (error) throw error;
    successResponse(res, categories || []);
  } catch (err) {
    next(err);
  }
};

const getTree = async (req, res, next) => {
  try {
    let treeQuery = supabase
      .from('categories')
      .select('*')
      .order('name');

    if (req.query.status) {
      treeQuery = treeQuery.eq('status', req.query.status);
    }

    const { data: all, error } = await treeQuery;

    if (error) throw error;

    const map = {};
    const roots = [];

    (all || []).forEach((cat) => {
      map[cat.id] = { ...cat, subcategories: [] };
    });

    (all || []).forEach((cat) => {
      if (cat.parent_id && map[cat.parent_id]) {
        map[cat.parent_id].subcategories.push(map[cat.id]);
      } else if (!cat.parent_id) {
        roots.push(map[cat.id]);
      }
    });

    successResponse(res, roots);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { data: category, error } = await supabase
      .from('categories')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!category) return errorResponse(res, 'Categoría no encontrada', 404);

    const { data: subcategories } = await supabase
      .from('categories')
      .select('*')
      .eq('parent_id', category.id)
      .order('name');

    successResponse(res, { ...category, subcategories: subcategories || [] });
  } catch (err) {
    next(err);
  }
};

const create = async (req, res, next) => {
  try {
    const { name, description, image_url, parent_id } = req.body;

    if (!name || !name.trim()) {
      return errorResponse(res, 'El nombre es requerido', 400);
    }

    const slug = slugify(name);

    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', slug)
      .maybeSingle();

    if (existing) {
      return errorResponse(res, 'Ya existe una categoría con ese nombre', 409);
    }

    if (parent_id) {
      const { data: parent } = await supabase
        .from('categories')
        .select('id')
        .eq('id', parent_id)
        .maybeSingle();

      if (!parent) {
        return errorResponse(res, 'La categoría padre no existe', 400);
      }
    }

    const { data: category, error } = await supabase
      .from('categories')
      .insert({
        name: name.trim(),
        slug,
        description: description || null,
        image_url: image_url || null,
        parent_id: parent_id || null,
      })
      .select('*')
      .single();

    if (error) throw error;
    successResponse(res, category, 'Categoría creada', 201);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, description, image_url, parent_id } = req.body;
    const updates = {};

    if (name !== undefined) {
      const slug = slugify(name);
      const { data: existing } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .neq('id', req.params.id)
        .maybeSingle();

      if (existing) {
        return errorResponse(res, 'Ya existe otra categoría con ese nombre', 409);
      }
      updates.name = name.trim();
      updates.slug = slug;
    }

    if (description !== undefined) updates.description = description;
    if (image_url !== undefined) updates.image_url = image_url;

    if (parent_id !== undefined) {
      if (Number(parent_id) === Number(req.params.id)) {
        return errorResponse(res, 'Una categoría no puede ser padre de sí misma', 400);
      }
      updates.parent_id = parent_id || null;
    }

    const { data: category, error } = await supabase
      .from('categories')
      .update(updates)
      .eq('id', req.params.id)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return errorResponse(res, 'Categoría no encontrada', 404);
      throw error;
    }

    successResponse(res, category, 'Categoría actualizada');
  } catch (err) {
    next(err);
  }
};

const _delete = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('categories')
      .update({ status: 'inactive' })
      .eq('id', req.params.id);

    if (error) {
      if (error.code === 'PGRST116') return errorResponse(res, 'Categoría no encontrada', 404);
      throw error;
    }

    successResponse(res, null, 'Categoría deshabilitada');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getTree, getById, create, update, delete: _delete };
