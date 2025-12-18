const Package = require('../models/Package');
const { validationResult } = require('express-validator');

// Get all packages
const getPackages = async (req, res) => {
  try {
    const packages = await Package.find({ status: 'active' })
      .populate('mentors') // <-- أضف هذا السطر
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      packages
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في جلب الباقات' });
  }
};

// Get package by ID
const getPackage = async (req, res) => {
  try {
    const package = await Package.findById(req.params.id);
    
    if (!package) {
      return res.status(404).json({ message: 'الباقة غير موجودة' });
    }

    res.json({
      success: true,
      package
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في جلب الباقة' });
  }
};

// Create package (Admin only)
const createPackage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: 'بيانات غير صحيحة', 
        errors: errors.array() 
      });
    }

    const package = await Package.create(req.body);

    res.status(201).json({
      success: true,
      message: 'تم إنشاء الباقة بنجاح',
      package
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في إنشاء الباقة' });
  }
};

// Update package (Admin only)
// adminController.js
const updatePackage = async (req, res) => {
    try {
        // لاحظ إضافة mentorIds هنا
        const { packageName, packagePrice, packageDescription, packageStatus, mentorIds } = req.body;
        const updatedPackageData = {
            name: packageName,
            price: packagePrice,
            description: packageDescription,
            status: packageStatus,
            mentors: mentorIds // <-- هذا هو السطر الجديد لحفظ المرشدين
        };
        const pkg = await Package.findByIdAndUpdate(req.params.id, updatedPackageData, { new: true });
        if (!pkg) {
            return res.status(404).json({ success: false, message: 'الباقة غير موجودة' });
        }
        res.json({ success: true, message: 'تم تحديث الباقة بنجاح' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في السيرفر' });
    }
};

// Delete package (Admin only)
const deletePackage = async (req, res) => {
  try {
    const package = await Package.findByIdAndDelete(req.params.id);

    if (!package) {
      return res.status(404).json({ message: 'الباقة غير موجودة' });
    }

    res.json({
      success: true,
      message: 'تم حذف الباقة بنجاح'
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في حذف الباقة' });
  }
};

module.exports = {
  getPackages,
  getPackage,
  createPackage,
  updatePackage,
  deletePackage
};