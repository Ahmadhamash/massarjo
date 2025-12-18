const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// ✅ ننشئ التوكن من الكائن كامل عشان نقدر نمرر role أيضاً
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE }
  );
};

// =======================
// 📝 Register user
// =======================
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'المستخدم موجود بالفعل' });
    }

    const user = await User.create({
      name,
      email,
      password
      // role: 'user'  // لو بدك تعطيه role افتراضي
    });

    // ❌ كانت هنا generateToken(user._id)
    // ✅ الصحيح:
    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الحساب بنجاح',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في إنشاء الحساب' });
  }
};

// =======================
// 🔑 Login user
// =======================
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        message: 'بيانات غير صحيحة',
        errors: errors.array()
      });
    }

    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ message: 'الحساب غير نشط' });
    }

    // ✅ نستخدم نفس الدالة مع user كامل
    const token = generateToken(user);

    res.json({
      success: true,
      message: 'تم تسجيل الدخول بنجاح',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في تسجيل الدخول' });
  }
};

// =======================
// 👤 Get current user
// =======================
const getMe = async (req, res) => {
  try {
    // في middleware حنرجّع user من الـ DB، وفيه _id و role وكل شيء
    const user = await User.findById(req.user.id)
      .select('-password')
      .populate('hollandResults')
      .populate('orders');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في جلب بيانات المستخدم' });
  }
};

module.exports = {
  register,
  login,
  getMe
};
