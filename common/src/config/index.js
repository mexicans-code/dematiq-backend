module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'dematiq-secret-key',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
