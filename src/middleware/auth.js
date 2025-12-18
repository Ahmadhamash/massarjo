const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'لا يوجد رمز مصادقة' });
    }

    const token = authHeader.replace('Bearer ', '').trim();

    if (!token) {
      return res.status(401).json({ message: 'لا يوجد رمز مصادقة' });
    }

    // نفك التوكن (فيه id و role لكن نعتمد على الـ DB للموثوقية)
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // نجلب المستخدم الحقيقي من الـ DB للتأكد من status وغيره
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'المستخدم غير موجود' });
    }

    if (user.status !== 'active') {
      return res.status(401).json({ message: 'الحساب غير نشط' });
    }

    // ✅ نخزن المستخدم بالكامل في req.user
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'رمز المصادقة غير صحيح' });
  }
};

module.exports = auth;
