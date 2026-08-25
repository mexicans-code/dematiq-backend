const express = require('express');
const router = express.Router();
const { verifyToken, optionalVerifyToken, adminForWrites } = require('../../../../common/src/middleware/auth');
const brandController = require('../controllers/brandController');

router.use(optionalVerifyToken);
router.get('/', brandController.getAll);
router.get('/:id', brandController.getById);

router.use(verifyToken, adminForWrites);
router.post('/', brandController.create);
router.put('/:id', brandController.update);
router.delete('/:id', brandController.delete);

module.exports = router;