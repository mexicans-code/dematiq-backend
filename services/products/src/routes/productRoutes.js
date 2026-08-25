const express = require('express');
const router = express.Router();
const { verifyToken, optionalVerifyToken, adminForWrites } = require('../../../../common/src/middleware/auth');
const productController = require('../controllers/productController');

// Rutas públicas (GET) - autenticación opcional
router.use(optionalVerifyToken);
router.get('/', productController.getAll);
router.get('/:id', productController.getById);

// Rutas protegidas (escritura) - requieren auth + admin
router.use(verifyToken, adminForWrites);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.delete);

module.exports = router;