const mongoose = require('mongoose');

const hollandResultSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [{
    questionIndex: Number,
    answer: String,
    type: String // R, I, A, S, E, C
  }],
  scores: {
    R: { type: Number, default: 0 }, // Realistic
    I: { type: Number, default: 0 }, // Investigative
    A: { type: Number, default: 0 }, // Artistic
    S: { type: Number, default: 0 }, // Social
    E: { type: Number, default: 0 }, // Enterprising
    C: { type: Number, default: 0 }  // Conventional
  },
  primaryType: {
    type: String,
    enum: ['R', 'I', 'A', 'S', 'E', 'C']
  },
  secondaryType: {
    type: String,
    enum: ['R', 'I', 'A', 'S', 'E', 'C']
  },
  analysis: {
    majors: [String],
    careers: [String],
    tips: [String]
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('HollandResult', hollandResultSchema);