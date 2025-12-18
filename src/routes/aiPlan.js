const express = require('express');
const { body } = require('express-validator');
const {
  generatePlan,
  getUserPlans,
  getPlan,
  deletePlan
} = require('../controllers/aiPlanController');
const auth = require('../middleware/auth');

const router = express.Router();

// Generate AI plan
router.post('/generate', auth, [
  body('specialty').notEmpty().withMessage('التخصص مطلوب'),
  body('specialty').isLength({ min: 3 }).withMessage('التخصص يجب أن يكون 3 أحرف على الأقل')
], generatePlan);

// Get user plans
router.get('/my-plans', auth, getUserPlans);

// Get specific plan
router.get('/:id', auth, getPlan);

// Delete plan
router.delete('/:id', auth, deletePlan);

module.exports = router;