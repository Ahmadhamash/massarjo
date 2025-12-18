const User = require('../models/User');
const Order = require('../models/Order'); // <-- تم التأكد من وجود هذا السطر
const { validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars');
  },
  filename: (req, file, cb) => {
    cb(null, `avatar-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('يجب أن تكون الصورة من نوع JPEG, JPG, PNG أو GIF'));
    }
  }
});

// --- الدوال الأساسية ---

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'بيانات غير صحيحة', 
        errors: errors.array() 
      });
    }

    const { name, phone } = req.body;
    const userId = req.user.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { name, phone },
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    res.json({
      success: true,
      message: 'تم تحديث الملف الشخصي بنجاح',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في تحديث الملف الشخصي' });
  }
};

// Change password
const changePassword = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'بيانات غير صحيحة', 
        errors: errors.array() 
      });
    }

    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'تم تغيير كلمة المرور بنجاح'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في تغيير كلمة المرور' });
  }
};

// Upload avatar
const uploadAvatar = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'يجب اختيار صورة' });
    }

    const userId = req.user.id;
    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const user = await User.findByIdAndUpdate(
      userId,
      { avatar: avatarPath },
      { new: true }
    ).select('-password');

    res.json({
      success: true,
      message: 'تم رفع الصورة بنجاح',
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في رفع الصورة' });
  }
};

// Delete account
const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;
    const userId = req.user.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'المستخدم غير موجود' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: 'كلمة المرور غير صحيحة' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ message: 'لا يمكن حذف حساب المدير' });
    }

    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: 'تم حذف الحساب بنجاح'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في حذف الحساب' });
  }
};

// --- الدالة الجديدة الخاصة بالطلبات ---

// Get user orders
// src/controllers/userController.js

// src/controllers/userController.js

const getUserOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user.id })
            // السطر التالي هو المهم، يجب أن يحتوي على 'name' وليس 'title'
            .populate('package', 'name price') 
            .populate('mentor', 'name')
            .sort({ createdAt: -1 });

        res.json({ success: true, orders });
    } catch (error) {
        console.error('Error fetching user orders:', error);
        res.status(500).json({ success: false, message: 'خطأ في السيرفر' });
    }
};


// --- تصدير كل الدوال ---
module.exports = {
  updateProfile,
  changePassword,
  uploadAvatar: [upload.single('avatar'), uploadAvatar],
  deleteAccount,
  getUserOrders // <-- تم التأكد من تصدير الدالة الجديدة
};