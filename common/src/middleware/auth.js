const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');
const supabase = require('../supabase');

async function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    
    // Verificar token_version contra base de datos
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('token_version, status')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !profile) {
      return res.status(401).json({ error: 'Usuario no encontrado' });
    }

    if (profile.status === 'inactive') {
      return res.status(403).json({ error: 'Cuenta deshabilitada' });
    }

    if ((decoded.token_version || 0) !== profile.token_version) {
      return res.status(401).json({ error: 'Token inválido o expirado. Inicia sesión nuevamente.' });
    }

    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expirado' });
    }
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Token inválido' });
    }
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

// Middleware opcional: valida token si existe, pero no lo requiere
async function optionalVerifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(); // Sin token, continúa sin usuario
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('token_version, status')
      .eq('id', decoded.id)
      .maybeSingle();

    if (error || !profile) {
      return next(); // Token inválido, continúa sin usuario
    }

    if (profile.status === 'inactive') {
      return next(); // Usuario inactivo, continúa sin usuario
    }

    if ((decoded.token_version || 0) !== profile.token_version) {
      return next(); // Token version mismatch, continúa sin usuario
    }

    req.user = decoded;
    next();
  } catch (err) {
    // Token inválido/expirado, continúa sin usuario
    next();
  }
}

function adminForWrites(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      try {
        const decoded = jwt.verify(authHeader.split(' ')[1], jwtSecret);
        req.user = decoded;
      } catch (e) {}
    }
    return next();
  }
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], jwtSecret);
    req.user = decoded;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Se requiere rol de administrador' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function requireAdmin(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  try {
    const decoded = jwt.verify(authHeader.split(' ')[1], jwtSecret);
    req.user = decoded;
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Se requiere rol de administrador' });
    }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

module.exports = { verifyToken, optionalVerifyToken, adminForWrites, requireAdmin };