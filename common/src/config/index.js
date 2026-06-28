if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET no configurado');
}
module.exports = {
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
};
