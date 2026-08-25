const express = require('express');
const router = express.Router();
const { verifyToken, adminForWrites } = require('../../../../common/src/middleware/auth');
const settingsController = require('../controllers/settingsController');

router.get('/:key', settingsController.getSetting);

router.use(verifyToken, adminForWrites);
router.put('/:key', settingsController.updateSetting);

module.exports = router;