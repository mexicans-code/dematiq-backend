const express = require('express');
const router = express.Router();
const { extractUser } = require('../../../../common/src/middleware/auth');
const orderController = require('../controllers/orderController');

router.use(extractUser);

router.get('/', orderController.getAll);
router.get('/:id', orderController.getById);
router.post('/', orderController.create);
router.put('/:id/status', orderController.updateStatus);

module.exports = router;
