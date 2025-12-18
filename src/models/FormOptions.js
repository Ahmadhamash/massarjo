const mongoose = require('mongoose');

const formOptionSchema = new mongoose.Schema({
  fieldName: {
    type: String,
    required: true,
    unique: true,
    enum: ['stepMajor', 'stepCurrentLevel', 'stepTimeline', 'stepPreferredTime', 'stepSessionType']
  },
  label: {
    type: String,
    required: true
  },
  options: [{
    value: {
      type: String,
      required: true
    },
    label: {
      type: String,
      required: true
    },
    order: {
      type: Number,
      default: 0
    }
  }],
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

formOptionSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FormOptions', formOptionSchema);
