const express = require('express');
const router = express.Router();
const { extractUser } = require('../../../../common/src/middleware/auth');
const productController = require('../controllers/productController');

router.use(extractUser);
router.get('/', productController.getAll);
router.get('/:id', productController.getById);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

module.exports = router;
