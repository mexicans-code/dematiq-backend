function errorHandler(err, req, res, next) {
  console.error(`[Error] ${err.message}`);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    error: err.message || 'Error interno del servidor',
  });
}

module.exports = errorHandler;
