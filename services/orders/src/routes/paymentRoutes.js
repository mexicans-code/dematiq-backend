const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../../../common/src/middleware/auth');
const paymentController = require('../controllers/paymentController');

router.post('/webhook', paymentController.webhook);

router.use(verifyToken);
router.post('/create-preference', paymentController.createPreference);
router.post('/verify-payment', paymentController.verifyPayment);
router.post('/reverify', paymentController.reverifyPayment);
router.post('/process-card', paymentController.processCardPayment);

module.exports = router;