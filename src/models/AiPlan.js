const mongoose = require('mongoose');

const aiPlanSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialty: {
    type: String,
    required: true
  },
  courses: [{
    title: String,
    description: String,
    provider: String,
    url: String,
    duration: String,
    level: String,
    price: String
  }],
  roadmap: [{
    phase: String,
    title: String,
    description: String,
    duration: String,
    skills: [String]
  }],
  recommendations: [String]
}, {
  timestamps: true
});

module.exports = mongoose.model('AiPlan', aiPlanSchema);