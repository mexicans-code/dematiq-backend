const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const supabase = require('../../../../common/src/supabase');
const { jwtSecret, jwtExpiresIn } = require('../config');
const { successResponse, errorResponse } = require('../../../../common/src/utils/response');

const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return errorResponse(res, 'Nombre, email y password son requeridos', 400);
    }

    const { data: existing } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existing) {
      return errorResponse(res, 'El email ya está registrado', 400);
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { data: profile, error } = await supabase
      .from('profiles')
      .insert({ name, email, password_hash })
      .select('id, name, email, role')
      .single();

    if (error) throw error;

    const token = jwt.sign(
      { id: profile.id, email: profile.email, name: profile.name, role: profile.role },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    successResponse(res, { token, user: profile }, 'Usuario registrado', 201);
  } catch (err) {
    next(err);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return errorResponse(res, 'Email y password son requeridos', 400);
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', email)
      .maybeSingle();

    if (error) throw error;
    if (!profile) {
      return errorResponse(res, 'Credenciales inválidas', 401);
    }

    const isMatch = await bcrypt.compare(password, profile.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'Credenciales inválidas', 401);
    }

    const token = jwt.sign(
      { id: profile.id, email: profile.email, name: profile.name, role: profile.role },
      jwtSecret,
      { expiresIn: jwtExpiresIn }
    );

    const { password_hash, ...user } = profile;
    successResponse(res, { token, user }, 'Login exitoso');
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'Token no proporcionado', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, jwtSecret);

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('id, name, email, phone, role, company_name, rfc')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error) throw error;
    if (!profile) {
      return errorResponse(res, 'Usuario no encontrado', 404);
    }

    successResponse(res, profile);
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return errorResponse(res, 'Token inválido o expirado', 401);
    }
    next(err);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { current, newPass } = req.body;

    if (!current || !newPass) {
      return errorResponse(res, 'Contraseña actual y nueva son requeridas', 400);
    }
    if (newPass.length < 6) {
      return errorResponse(res, 'La nueva contraseña debe tener al menos 6 caracteres', 400);
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('password_hash')
      .eq('id', req.user.id)
      .maybeSingle();

    if (error) throw error;
    if (!profile) return errorResponse(res, 'Usuario no encontrado', 404);

    const isMatch = await bcrypt.compare(current, profile.password_hash);
    if (!isMatch) {
      return errorResponse(res, 'La contraseña actual es incorrecta', 401);
    }

    const password_hash = await bcrypt.hash(newPass, 10);
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ password_hash, updated_at: new Date().toISOString() })
      .eq('id', req.user.id);

    if (updateError) throw updateError;

    successResponse(res, null, 'Contraseña actualizada exitosamente');
  } catch (err) {
    next(err);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name && !email) {
      return errorResponse(res, 'Nombre o email son requeridos', 400);
    }

    const updates = {};
    if (name) updates.name = name;
    if (email) updates.email = email;
    updates.updated_at = new Date().toISOString();

    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', req.user.id)
      .select('id, name, email, phone, role, company_name, rfc')
      .single();

    if (error) throw error;
    if (!profile) return errorResponse(res, 'Usuario no encontrado', 404);

    successResponse(res, profile);
  } catch (err) {
    next(err);
  }
};

module.exports = { register, login, getMe, changePassword, updateProfile };
