const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-preference', paymentController.createPreference);
router.post('/verify-payment', paymentController.verifyPayment);
router.post('/webhook', paymentController.webhook);
router.post('/reverify', paymentController.reverifyPayment);
router.post('/process-card', paymentController.processCardPayment);

module.exports = router;
