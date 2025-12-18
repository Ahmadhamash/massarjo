const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم الباقة مطلوب'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'وصف الباقة مطلوب']
  },
  price: {
    type: Number,
    required: [true, 'سعر الباقة مطلوب'],
    min: 0
  },
  // --- هذا هو السطر الجديد والمهم ---
  mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' }]
,
  // ---------------------------------
  features: [{
    type: String,
    required: true
  }],
  duration: {
    type: Number, // in days
    required: true,
    default: 30
  },
  sessionsIncluded: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  category: {
    type: String,
    enum: ['student', 'graduate', 'professional'],
    required: true
  },
  orderCount: {
    type: Number,
    default: 0
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Package', packageSchema);