const Mentor = require('../models/Mentor');
const { validationResult } = require('express-validator');

// Get all mentors
const getMentors = async (req, res) => {
  try {
    const mentors = await Mentor.find({ status: 'active' })
      .select('-email')
      .sort({ rating: -1 });

    res.json({
      success: true,
      mentors
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في جلب المرشدين' });
  }
};

// Get mentor by ID
const getMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .select('-email')
      .populate('sessions');

    if (!mentor) {
      return res.status(404).json({ message: 'المرشد غير موجود' });
    }

    res.json({
      success: true,
      mentor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في جلب بيانات المرشد' });
  }
};

// Create mentor (Admin only)
const createMentor = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'بيانات غير صحيحة', 
        errors: errors.array() 
      });
    }

    const mentor = await Mentor.create(req.body);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء المرشد بنجاح',
      mentor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في إنشاء المرشد' });
  }
};

// Update mentor (Admin only)
const updateMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!mentor) {
      return res.status(404).json({ message: 'المرشد غير موجود' });
    }

    res.json({
      success: true,
      message: 'تم تحديث بيانات المرشد بنجاح',
      mentor
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في تحديث بيانات المرشد' });
  }
};

// Delete mentor (Admin only)
const deleteMentor = async (req, res) => {
  try {
    const mentor = await Mentor.findByIdAndDelete(req.params.id);

    if (!mentor) {
      return res.status(404).json({ message: 'المرشد غير موجود' });
    }

    res.json({
      success: true,
      message: 'تم حذف المرشد بنجاح'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في حذف المرشد' });
  }
};

// Get mentor availability
const getMentorAvailability = async (req, res) => {
  try {
    const mentor = await Mentor.findById(req.params.id)
      .select('availability name');

    if (!mentor) {
      return res.status(404).json({ message: 'المرشد غير موجود' });
    }

    res.json({
      success: true,
      availability: mentor.availability
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في جلب مواعيد المرشد' });
  }
};

module.exports = {
  getMentors,
  getMentor,
  createMentor,
  updateMentor,
  deleteMentor,
  getMentorAvailability
};