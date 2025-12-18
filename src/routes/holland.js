const express = require('express');
const { body } = require('express-validator');
const {
  submitAssessment,
  getResults,
  getQuestions
} = require('../controllers/hollandController');
const auth = require('../middleware/auth');

const router = express.Router();

// Get questions (public)
router.get('/questions', getQuestions);

// Submit assessment (auth required)
router.post('/submit', auth, [
  body('answers').isArray().withMessage('الإجابات يجب أن تكون مصفوفة'),
  body('answers').isLength({ min: 60, max: 60 }).withMessage('يجب الإجابة على جميع الأسئلة')
], submitAssessment);

// Get user results
router.get('/results', auth, getResults);

module.exports = router;