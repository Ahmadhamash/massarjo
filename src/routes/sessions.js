const express = require('express');
const { body } = require('express-validator');

// استيراد الدوال من الكنترولر
const {
  getAllSessions,
  getSession,
  createSession,
  updateSession,
  updateSessionStatus,
  getUserSessions,
  addUserFeedback,
  cancelSession
} = require('../controllers/sessionController');

// استيراد middleware
const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// =======================================================
// ✅ 1. الروابط المحددة (Specific Routes) - يجب أن تكون في البداية
// =======================================================

// رابط جلسات المستخدم (تم رفعه للأعلى لحل مشكلة 403)
router.get('/my-sessions', auth, getUserSessions);


// =======================================================
// ✅ 2. مسارات المدير (Admin Routes) العامة
// =======================================================
router.get('/', adminAuth, getAllSessions);         // جلب كل الجلسات
router.post('/', adminAuth, createSession);        // إنشاء جلسة جديدة


// =======================================================
// ✅ 3. الروابط الديناميكية (Dynamic Routes :id) - يجب أن تكون في النهاية
// =======================================================

// هذا الرابط يستقبل أي شيء كـ id، لذا يجب أن يكون بعد my-sessions
// لو كان في البداية، سيظن السيرفر أن كلمة "my-sessions" هي عبارة عن "id" ويطلب صلاحية مدير
router.get('/:id', adminAuth, getSession);         

router.put('/:id', adminAuth, updateSession);      // تعديل بيانات الجلسة
router.put('/:id/status', adminAuth, updateSessionStatus); // تعديل حالة الجلسة فقط


// =======================================================
// ✅ 4. باقي مسارات المستخدم التي تعتمد على ID
// =======================================================
router.put('/:id/feedback', auth, [
  body('feedback').notEmpty().withMessage('التقييم مطلوب'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('التقييم يجب أن يكون بين 1 و 5')
], addUserFeedback);

router.put('/:id/cancel', auth, cancelSession);

module.exports = router;