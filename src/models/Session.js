// src/models/Session.js
const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  title: { // <-- حقل جديد لعنوان الجلسة
    type: String,
    required: false,
    default: 'جلسة إرشادية'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  mentor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Mentor',
    required: true
  },
  order: { // <-- أصبح الحقل اختياريًا
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false
  },
  scheduledDate: {
    type: Date,
    required: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  price: { // <-- حقل جديد للسعر
    type: Number,
    default: 0
  },
  userPhone: { // <-- حقل جديد لرقم هاتف المستخدم
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'cancelled', 'no_show'],
    default: 'scheduled'
  },
  meetingLink: {
    type: String
  },
  notes: {
    mentorNotes: {
      type: String,
      maxlength: 1000
    },
    userFeedback: {
      type: String,
      maxlength: 500
    }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Session', sessionSchema);