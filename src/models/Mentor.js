const mongoose = require('mongoose');

const mentorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'اسم المرشد مطلوب'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'البريد الإلكتروني مطلوب'],
    unique: true,
    lowercase: true
  },
  title: {
    type: String,
    required: [true, 'المسمى الوظيفي مطلوب']
  },
  specialty: {
    type: String,
    required: [true, 'التخصص مطلوب']
  },
  experience: {
    type: Number,
    required: [true, 'سنوات الخبرة مطلوبة'],
    min: 0
  },
  bio: {
    type: String,
    default: '',
    maxlength: 2000
  },
  avatar: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  sessionsCount: {
    type: Number,
    default: 0
  },
  availability: [{
    day: {
      type: String,
      enum: ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    },
    timeSlots: [{
      start: String,
      end: String
    }]
  }],
  sessions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Session'
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Mentor', mentorSchema);