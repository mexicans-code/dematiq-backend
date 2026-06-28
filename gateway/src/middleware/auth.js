const { verifyToken } = require('../../../common/src/middleware/auth');

function adminForWrites(req, res, next) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    return next();
  }
  verifyToken(req, res, (err) => {
    if (err) return;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Se requiere rol de administrador' });
    }
    next();
  });
}

function requireAdmin(req, res, next) {
  verifyToken(req, res, (err) => {
    if (err) return;
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Se requiere rol de administrador' });
    }
    next();
  });
}

module.exports = { verifyToken, adminForWrites, requireAdmin };
