const express = require('express');
const router = express.Router();
const { getRoles } = require('../controllers/roleController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getRoles);

module.exports = router;
