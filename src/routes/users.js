const express = require('express');
const { body } = require('express-validator');
const {
  updateProfile,
  changePassword,
  uploadAvatar,
  deleteAccount,
  getUserOrders // <-- تأكد من استيراد الدالة الجديدة
} = require('../controllers/userController');
const auth = require('../middleware/auth');

const router = express.Router();

// 👇 الرابط الجديد الذي سيتم استخدامه لجلب طلبات المستخدم
router.get('/my-orders', auth, getUserOrders);

// --- الروابط القديمة تبقى كما هي ---

// Update profile
router.put('/profile', auth, [
  body('name').notEmpty().withMessage('الاسم مطلوب'),
  body('phone').optional().isMobilePhone('ar-SA').withMessage('رقم الهاتف غير صحيح')
], updateProfile);

// Change password
router.put('/password', auth, [
  body('currentPassword').notEmpty().withMessage('كلمة المرور الحالية مطلوبة'),
  body('newPassword').isLength({ min: 6 }).withMessage('كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل')
], changePassword);

// Upload avatar
router.post('/avatar', auth, uploadAvatar);

// Delete account
router.delete('/account', auth, [
  body('password').notEmpty().withMessage('كلمة المرور مطلوبة للتأكيد')
], deleteAccount);

module.exports = router;