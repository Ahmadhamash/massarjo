// src/routes/cvRequests.js
const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const CvRequest = require('../models/CvRequest');

// إنشاء طلب CV (من الطالب)
router.post('/', upload.single('cvFile'), async (req, res) => {
  try {
    console.log('🔥 1. وصل طلب جديد للسيرة الذاتية!');
    console.log('📄 البيانات النصية:', req.body);
    console.log('📁 الملف المرفق:', req.file);
    const {
      fullName,
      email,
      phone,
      notes,
      currentLevel,
      targetJobTitle,
      yearsOfExperience,
      linkedinProfile,
      packageName,
      packagePrice,
    } = req.body;

    const cvRequest = await CvRequest.create({
      user: req.user ? req.user.id : null, // optional
      fullName,
      email,
      phone,
      notes,
      currentLevel,
      targetJobTitle,
      yearsOfExperience: yearsOfExperience || 0,
      linkedinProfile,
      packageName: packageName || 'طلب سيرة ذاتية',
      packagePrice: packagePrice || 0,
      cvFilePath: req.file ? `/uploads/${req.file.filename}` : null,
      status: 'pending',
    });

    return res.json({ success: true, request: cvRequest });
  } catch (err) {
  console.error('Error saving CV request:', err);
  return res.status(500).json({
    success: false,
    message: err.message, // مؤقتًا عشان نعرف السبب
  });
}
});

// جلب كل الطلبات (للأدمن)
router.get('/all', async (req, res) => {
  try {
    const requests = await CvRequest.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone');

    return res.json({ success: true, requests });
  } catch (err) {
    console.error('Error fetching CV requests:', err);
    return res
      .status(500)
      .json({ success: false, message: 'خطأ في جلب الطلبات' });
  }
});

// تحديث حالة الطلب
router.put('/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const request = await CvRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    return res.json({ success: true, request });
  } catch (err) {
    console.error('Error updating CV request status:', err);
    return res
      .status(500)
      .json({ success: false, message: 'خطأ في تحديث حالة الطلب' });
  }
});

// (اختياري) جلب طلبات مستخدم معيّن لو حبيتي تستخدميها لاحقاً
router.get('/my-requests', async (req, res) => {
  try {
    if (!req.user) {
      return res.json({ success: true, requests: [] });
    }

    const requests = await CvRequest.find({ user: req.user.id }).sort({
      createdAt: -1,
    });

    return res.json({ success: true, requests });
  } catch (err) {
    console.error('Error fetching user CV requests:', err);
    return res
      .status(500)
      .json({ success: false, message: 'خطأ في جلب طلبات المستخدم' });
  }
});

module.exports = router;
