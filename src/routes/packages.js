const express = require('express');
const Package = require('../models/Package');

const router = express.Router();

// Get all packages for the public homepage
router.get('/', async (req, res) => {
  try {
    // --- سطر التشخيص الأول ---
    console.log("--- [1] ROUTE: GET /api/packages CALLED ---");

    const packages = await Package.find({ status: 'active' })
      .populate('mentors') // هذا السطر يجب أن يجلب تفاصيل المرشدين
      .sort({ createdAt: -1 });

    // --- سطر التشخيص الثاني ---
    console.log("--- [2] DATA: Packages sent to frontend (check 'mentors' array): ---");
    console.log(JSON.stringify(packages, null, 2)); // سيطبع البيانات بشكل واضح

    res.json({
      success: true,
      packages
    });

  } catch (error) {
    console.error("--- [ERROR] in GET /api/packages: ---", error);
    res.status(500).json({ message: 'خطأ في جلب الباقات' });
  }
});

// Get a single package by its ID
router.get('/:id', async (req, res) => {
  try {
    const package = await Package.findById(req.params.id)
      .populate('mentors'); 
    
    if (!package) {
      return res.status(404).json({ message: 'الباقة غير موجودة' });
    }

    res.json({
      success: true,
      package
    });
  } catch (error) {
    res.status(500).json({ message: 'خطأ في جلب الباقة' });
  }
});

module.exports = router;