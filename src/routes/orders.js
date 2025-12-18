// routes/orders.js
const express = require('express');
const router = express.Router();

const {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getMentorOrders,   // ✅ أضفنا الدالة الجديدة
} = require('../controllers/orderController');

const auth = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// =======================
// 🧑‍💻 مسارات المستخدم العادي
// =======================
router.post('/', auth, createOrder);
router.get('/my-orders', auth, getUserOrders);
router.get('/:id', auth, getOrder);
router.put('/:id/cancel', auth, cancelOrder);

// =======================
// 🎓 مسارات المرشد
// =======================
// مهم جداً يكون قبل '/:id' عشان ما يتعامل معها كـ باراميتر
router.get('/mentor/my-orders', auth, getMentorOrders);

// =======================
// 👑 مسارات الأدمن (لوحة التحكم)
// =======================
router.get('/', adminAuth, getAllOrders);
router.put('/:id/status', adminAuth, updateOrderStatus);

module.exports = router;
