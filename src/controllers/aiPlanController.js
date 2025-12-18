const AiPlan = require('../models/AiPlan');
const User = require('../models/User');
const { generateCareerPlan } = require('../utils/aiService');
const { validationResult } = require('express-validator');

// Generate AI career plan
const generatePlan = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'بيانات غير صحيحة', 
        errors: errors.array() 
      });
    }

    const { specialty } = req.body;
    const userId = req.user.id;

    // Generate plan using AI
    const planData = await generateCareerPlan(specialty);

    // Save plan to database
    const aiPlan = await AiPlan.create({
      user: userId,
      specialty,
      courses: planData.courses,
      roadmap: planData.roadmap,
      recommendations: planData.recommendations
    });

    res.json({
      success: true,
      message: 'تم إنشاء الخطة بنجاح',
      plan: aiPlan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في إنشاء الخطة' });
  }
};

// Get user's AI plans
const getUserPlans = async (req, res) => {
  try {
    const plans = await AiPlan.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      plans
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في جلب الخطط' });
  }
};

// Get plan by ID
const getPlan = async (req, res) => {
  try {
    const plan = await AiPlan.findById(req.params.id)
      .populate('user', 'name email');

    if (!plan) {
      return res.status(404).json({ message: 'الخطة غير موجودة' });
    }

    // Check if user owns this plan or is admin
    if (plan.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'غير مخول للوصول لهذه الخطة' });
    }

    res.json({
      success: true,
      plan
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في جلب الخطة' });
  }
};

// Delete plan
const deletePlan = async (req, res) => {
  try {
    const plan = await AiPlan.findById(req.params.id);

    if (!plan) {
      return res.status(404).json({ message: 'الخطة غير موجودة' });
    }

    // Check if user owns this plan
    if (plan.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'غير مخول لحذف هذه الخطة' });
    }

    await AiPlan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'تم حذف الخطة بنجاح'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في حذف الخطة' });
  }
};

module.exports = {
  generatePlan,
  getUserPlans,
  getPlan,
  deletePlan
};