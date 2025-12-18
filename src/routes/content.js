const express = require('express');
const router = express.Router();
const { getAllContent, getContent, updateContent } = require('../controllers/contentController');
const adminAuth = require('../middleware/adminAuth');

// جلب جميع أقسام المحتوى (عام)
router.get('/all', getAllContent);

// جلب قسم محدد من المحتوى (عام)
router.get('/:sectionName', getContent);

// تحديث قسم محدد من المحتوى (أدمن فقط)
router.put('/:sectionName', adminAuth, updateContent);

module.exports = router;