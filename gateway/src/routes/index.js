const express = require('express');
const proxy = require('express-http-proxy');
const router = express.Router();
const { verifyToken, adminForWrites, requireAdmin } = require('../middleware/auth');

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USERS_SERVICE = process.env.USERS_SERVICE_URL || 'http://localhost:3002';
const PRODUCTS_SERVICE = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003';
const ORDERS_SERVICE = process.env.ORDERS_SERVICE_URL || 'http://localhost:3004';

function proxyWithPrefix(target, prefix) {
  return proxy(target, {
    proxyReqPathResolver: (req) => `${prefix}${req.url}`,
    proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
      if (srcReq.user) {
        proxyReqOpts.headers['x-user-id'] = srcReq.user.id;
        proxyReqOpts.headers['x-user-role'] = srcReq.user.role;
        proxyReqOpts.headers['x-user-name'] = srcReq.user.name || '';
      }
      return proxyReqOpts;
    },
  });
}

// Public
router.use('/auth', proxyWithPrefix(AUTH_SERVICE, '/auth'));
router.use('/quotations', proxyWithPrefix(PRODUCTS_SERVICE, '/quotations'));

// Public reads, admin-only writes
router.use('/products', adminForWrites, proxyWithPrefix(PRODUCTS_SERVICE, '/products'));
router.use('/categories', adminForWrites, proxyWithPrefix(PRODUCTS_SERVICE, '/categories'));
router.use('/brands', adminForWrites, proxyWithPrefix(PRODUCTS_SERVICE, '/brands'));

// Authenticated
router.use('/orders', verifyToken, proxyWithPrefix(ORDERS_SERVICE, '/orders'));

// Payments: webhook public, rest authenticated
function paymentsAuth(req, res, next) {
  if (req.path === '/webhook') return next();
  verifyToken(req, res, next);
}
router.use('/payments', paymentsAuth, proxyWithPrefix(ORDERS_SERVICE, '/payments'));

// Settings: GET public, writes admin-only
router.get('/settings/:key', proxyWithPrefix(PRODUCTS_SERVICE, '/settings'));
router.put('/settings/:key', requireAdmin, proxyWithPrefix(PRODUCTS_SERVICE, '/settings'));

// Admin only
router.use('/users', requireAdmin, proxyWithPrefix(USERS_SERVICE, '/users'));
router.use('/upload', requireAdmin, proxyWithPrefix(PRODUCTS_SERVICE, '/upload'));

module.exports = router;
