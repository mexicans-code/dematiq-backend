const express = require('express');
const router = express.Router();
const quotationController = require('../controllers/quotationController');

router.post('/', quotationController.send);
router.post('/contact', quotationController.sendContact);

module.exports = router;
