function successResponse(res, data, message = 'OK', statusCode = 200) {
  return res.status(statusCode).json({ message, data });
}

function errorResponse(res, message = 'Error interno', statusCode = 500) {
  return res.status(statusCode).json({ error: message });
}

module.exports = { successResponse, errorResponse };
