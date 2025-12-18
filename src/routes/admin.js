// src/routes/admin.js

const express = require('express');
const router = express.Router();
const adminAuth = require('../middleware/adminAuth');

// --- 1. استيراد الدالة الصحيحة من orderController ---
const { getAllOrders } = require('../controllers/orderController');

// --- 2. استيراد باقي الدوال من adminController ---
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  deleteUser,
  getAnalytics,
  getAllPackages, 
  createPackage, 
  updatePackage, 
  deletePackage,
  getAllMentors, 
  createMentor, 
  updateMentor, 
  deleteMentor,
  getAllSessions,
  // تم حذف getAllOrders من هنا لأننا استوردناها من المصدر الصحيح
  updateOrderStatus,
  createSession,
  updateSession,
  deleteSession
} = require('../controllers/adminController');


// === ربط كل وظيفة برابط URL ===

// --- مسارات الطلبات (Admin) ---
// --- 3. التأكد من أن الرابط يستخدم الدالة الصحيحة المستوردة ---
router.get('/orders', adminAuth, getAllOrders); 
router.put('/orders/:id/status', adminAuth, updateOrderStatus);


// (باقي الكود في الملف يبقى كما هو)
// ...

// رابط لجلب إحصائيات لوحة التحكم الرئيسية
router.get('/stats', adminAuth, getDashboardStats);

// رابط لجلب كل المستخدمين
router.get('/users', adminAuth, getAllUsers);

// --- مسارات الجلسات ---
router.get('/sessions', adminAuth, getAllSessions);
router.post('/sessions', adminAuth, createSession);
router.put('/sessions/:id', adminAuth, updateSession);
router.delete('/sessions/:id', adminAuth, deleteSession);

// رابط لتحديث حالة مستخدم معين
router.put('/users/:id/status', adminAuth, updateUserStatus);

// رابط لحذف مستخدم معين
router.delete('/users/:id', adminAuth, deleteUser);

// رابط لجلب التحليلات المتقدمة
router.get('/analytics', adminAuth, getAnalytics);

// --- مسارات الباقات ---
router.get('/packages', adminAuth, getAllPackages);
router.post('/packages', adminAuth, createPackage);
router.put('/packages/:id', adminAuth, updatePackage);
router.delete('/packages/:id', adminAuth, deletePackage);

// --- مسارات المرشدين ---
router.get('/mentors', adminAuth, getAllMentors);
router.post('/mentors', adminAuth, createMentor);
router.put('/mentors/:id', adminAuth, updateMentor);
router.delete('/mentors/:id', adminAuth, deleteMentor);

module.exports = router;