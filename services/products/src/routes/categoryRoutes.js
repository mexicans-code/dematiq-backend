const express = require('express');
const router = express.Router();
const { extractUser } = require('../../../../common/src/middleware/auth');
const categoryController = require('../controllers/categoryController');

router.use(extractUser);
router.get('/tree', categoryController.getTree);
router.get('/', categoryController.getAll);
router.get('/:id', categoryController.getById);
router.post('/', categoryController.create);
router.put('/:id', categoryController.update);
router.delete('/:id', categoryController.delete);

module.exports = router;
