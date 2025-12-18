// src/middleware/upload.js
const path = require('path');
const multer = require('multer');

// مكان حفظ الملفات (مجلد uploads في جذر المشروع)
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// فلتر بسيط للملفات (اختياري – نسمح بـ pdf و doc و docx)
function fileFilter(req, file, cb) {
  const allowed = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('نوع ملف غير مسموح. الرجاء رفع PDF أو Word'), false);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // حد أقصى 5 ميغابايت
});

module.exports = upload;
