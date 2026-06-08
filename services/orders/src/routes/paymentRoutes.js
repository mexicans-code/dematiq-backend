const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.post('/create-preference', paymentController.createPreference);
router.post('/verify-payment', paymentController.verifyPayment);
router.post('/webhook', paymentController.webhook);

module.exports = router;
