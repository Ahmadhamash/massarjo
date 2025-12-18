const mongoose = require('mongoose');

const cvRequestSchema = new mongoose.Schema(
  {
    // المستخدم (اختياري حالياً)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      default: null,
    },

    // بيانات التواصل
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },

    // تفاصيل مهنية
    currentLevel: {
      type: String,
      default: '',
    },
    targetJobTitle: {
      type: String,
      default: '',
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
    linkedinProfile: {
      type: String,
      default: '',
    },

    // تفاصيل الطلب
    packageName: {
      type: String,
      required: true,
    },
    packagePrice: {
      type: Number,
      required: true,
    },
    notes: {
      type: String,
      default: '',
    },

    // ملف السيرة الذاتية
    cvFilePath: {
      type: String,
      default: null,
    },

    // حالة الطلب
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('CvRequest', cvRequestSchema);
