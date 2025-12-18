const auth = require('./auth');

const adminAuth = async (req, res, next) => {
  auth(req, res, () => {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'غير مخول للوصول لهذه الصفحة' });
    }
    next();
  });
};

module.exports = adminAuth;