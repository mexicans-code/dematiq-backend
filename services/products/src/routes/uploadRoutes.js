const express = require('express');
const multer = require('multer');
const router = express.Router();
const uploadController = require('../controllers/uploadController');

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
});

router.post('/', upload.single('file'), uploadController.upload);

module.exports = router;
