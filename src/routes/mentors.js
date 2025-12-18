const express = require('express');
const { body } = require('express-validator');
const {
  getMentors,
  getMentor,
  createMentor,
  updateMentor,
  deleteMentor,
  getMentorAvailability
} = require('../controllers/mentorController');
const adminAuth = require('../middleware/adminAuth');

const router = express.Router();

// Public routes
router.get('/', getMentors);
router.get('/:id', getMentor);
router.get('/:id/availability', getMentorAvailability);

// Admin routes
router.post('/', adminAuth, [
  body('name').notEmpty().withMessage('اسم المرشد مطلوب'),
  body('email').isEmail().withMessage('البريد الإلكتروني غير صحيح'),
  body('title').notEmpty().withMessage('المسمى الوظيفي مطلوب'),
  body('specialty').notEmpty().withMessage('التخصص مطلوب'),
  body('experience').isNumeric().withMessage('سنوات الخبرة يجب أن تكون رقم')
], createMentor);

router.put('/:id', adminAuth, updateMentor);
router.delete('/:id', adminAuth, deleteMentor);

module.exports = router;