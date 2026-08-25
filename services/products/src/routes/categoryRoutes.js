const express = require('express');
const router = express.Router();
const { verifyToken, optionalVerifyToken, adminForWrites } = require('../../../../common/src/middleware/auth');
const categoryController = require('../controllers/categoryController');

router.use(optionalVerifyToken);
router.get('/tree', categoryController.getTree);
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);

router.use(verifyToken, adminForWrites);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;