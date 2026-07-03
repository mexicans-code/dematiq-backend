const logger = require('../utils/logger');

function errorHandler(err, req, res, next) {
  const statusCode = Number(err.statusCode) || 500;
  const message = statusCode === 500 ? 'Error interno del servidor' : err.message;

  logger.error(err.message, {
    statusCode,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    method: req.method,
    path: req.path,
  });

  res.status(statusCode).json({ error: message });
}

module.exports = errorHandler;
