const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
  sectionName: {
    type: String,
    required: true,
    unique: true,
    enum: ['hero', 'howItWorks', 'achievements', 'services', 'testimonials']
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

contentSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('Content', contentSchema);
