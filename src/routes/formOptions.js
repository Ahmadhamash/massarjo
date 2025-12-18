const express = require('express');
const router = express.Router();
const {
  getFieldOptions,
  getAllFormOptions,
  updateFieldOptions,
  initializeDefaultOptions
} = require('../controllers/formOptionsController');
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

router.get('/all', getAllFormOptions);

router.get('/:fieldName', getFieldOptions);

router.put('/:fieldName', auth, adminAuth, updateFieldOptions);

router.post('/initialize', auth, adminAuth, initializeDefaultOptions);

module.exports = router;
