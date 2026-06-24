const supabase = require('../../../../common/src/supabase');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

const getAll = async (req, res, next) => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('id, name, email, phone, role, company_name, rfc, status, created_at');

    if (error) throw error;
    successResponse(res, profiles || []);
  } catch (err) {
    next(err);
  }
};

const getById = async (req, res, next) => {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name, email, phone, role, company_name, rfc, status, created_at')
      .eq('id', req.params.id)
      .maybeSingle();

    if (error) throw error;
    if (!profile) return errorResponse(res, 'Usuario no encontrado', 404);

    successResponse(res, profile);
  } catch (err) {
    next(err);
  }
};

const update = async (req, res, next) => {
  try {
    const { name, email, phone, company_name, rfc, role, status } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    if (phone !== undefined) updates.phone = phone;
    if (company_name !== undefined) updates.company_name = company_name;
    if (rfc !== undefined) updates.rfc = rfc;
    if (role !== undefined) updates.role = role;
    if (status !== undefined) updates.status = status;
    updates.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.params.id)
      .select('id, name, email, phone, role, company_name, rfc, status')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return errorResponse(res, 'Usuario no encontrado', 404);
      throw error;
    }

    successResponse(res, profile, 'Usuario actualizado');
  } catch (err) {
    next(err);
  }
};

const _delete = async (req, res, next) => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'inactive', updated_at: new Date().toISOString() })
      .eq('id', req.params.id);

    if (error) throw error;
    successResponse(res, null, 'Usuario deshabilitado');
  } catch (err) {
    next(err);
  }
};

module.exports = { getAll, getById, update, delete: _delete };
