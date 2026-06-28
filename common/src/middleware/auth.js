const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config');

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
}

function extractUser(req, res, next) {
  const id = req.headers['x-user-id'];
  const role = req.headers['x-user-role'];
  const name = req.headers['x-user-name'];
  if (id) {
    req.user = { id, role, name };
  }
  next();
}

module.exports = { verifyToken, extractUser };
