const express = require('express');
const proxy = require('express-http-proxy');
const router = express.Router();

const AUTH_SERVICE = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
const USERS_SERVICE = process.env.USERS_SERVICE_URL || 'http://localhost:3002';
const PRODUCTS_SERVICE = process.env.PRODUCTS_SERVICE_URL || 'http://localhost:3003';
const ORDERS_SERVICE = process.env.ORDERS_SERVICE_URL || 'http://localhost:3004';

function proxyWithPrefix(target, prefix) {
  return proxy(target, {
    proxyReqPathResolver: (req) => `${prefix}${req.url}`,
  });
}

router.use('/auth', proxyWithPrefix(AUTH_SERVICE, '/auth'));
router.use('/users', proxyWithPrefix(USERS_SERVICE, '/users'));
router.use('/products', proxyWithPrefix(PRODUCTS_SERVICE, '/products'));
router.use('/orders', proxyWithPrefix(ORDERS_SERVICE, '/orders'));
router.use('/payments', proxyWithPrefix(ORDERS_SERVICE, '/payments'));
router.use('/categories', proxyWithPrefix(PRODUCTS_SERVICE, '/categories'));

module.exports = router;
