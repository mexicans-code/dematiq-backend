const express = require('express');
const rateLimit = require('express-rate-limit');
const router = express.Router();
const { verifyToken } = require('../../../../common/src/middleware/auth');
const authController = require('../controllers/authController');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos, intente de nuevo en 15 minutos' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);
router.get('/me', authController.getMe);
router.patch('/password', verifyToken, authController.changePassword);
router.patch('/profile', verifyToken, authController.updateProfile);

module.exports = router;
