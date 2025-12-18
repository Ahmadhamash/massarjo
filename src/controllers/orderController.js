const Order = require('../models/Order');
const Package = require('../models/Package');
const User = require('../models/User');
const Mentor = require('../models/Mentor');
const HollandResult = require('../models/HollandResult'); // <-- إضافة مهمة
const { validationResult } = require('express-validator');
const { sendOrderConfirmation } = require('../utils/emailService');

// ✅ تم تعريف كل الدوال كـ const لتوحيد الطريقة
// 1. Create order
const createOrder = async (req, res) => {
  try {
    const { 
      packageId, packageName, packagePrice,
      mentorId, mentorName,
      fullName, phone, email, 
      major, currentLevel, interests,
      goals, timeline, challenges,
      preferredTime, sessionType, additionalNotes,
      paymentMethod 
    } = req.body;

    console.log('📦 Creating order with data:', req.body);

    // جلب آخر نتيجة لمقياس هولاند للمستخدم
    const latestHollandResult = await HollandResult.findOne({ user: req.user.id }).sort({ createdAt: -1 });

    const packageItem = await Package.findById(packageId);
    if (!packageItem) {
      return res.status(404).json({ success: false, message: 'الباقة غير موجودة' });
    }

    const order = new Order({
      user: req.user.id,
      package: packageId,
      packageName: packageName || packageItem.name,
      packagePrice: packagePrice || packageItem.price,
      mentor: mentorId,
      mentorName: mentorName,
      
      customerInfo: {
        name: fullName,
        phone: phone,
        email: email,
      },
      
      orderDetails: {
        major,
        currentLevel,
        interests: interests || [],
        goals,
        timeline,
        challenges,
        preferredTime,
        sessionType,
        additionalNotes,
      },
      hollandResult: latestHollandResult ? latestHollandResult._id : null, // <-- حفظ نتيجة هولاند مع الطلب
      
      totalAmount: packageItem.price,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending',
    });

    const createdOrder = await order.save();
    console.log('✅ Order created successfully:', createdOrder._id);
    
    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    console.error('❌ Error creating order:', error);
    res.status(500).json({ success: false, message: 'خطأ في إنشاء الطلب', error: error.message });
  }
};

// 2. Get user orders
// src/controllers/orderController.js

// src/controllers/orderController.js

const getUserOrders = async (req, res) => {
  try {
    // ✅ إضافة تحقق للتأكد من أن المستخدم موجود ومسجل دخوله
    if (!req.user || !req.user.id) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }

    const orders = await Order.find({ user: req.user.id })
      .populate('package', 'name price features')
      .populate('mentor', 'name title avatar')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      orders
    });
  } catch (error) {
    // في حال حدوث أي خطأ آخر، سيتم تسجيله وإرسال رد 500
    console.error("Error in getUserOrders:", error);
    res.status(500).json({ message: 'خطأ في جلب الطلبات' });
  }
};

// 3. ✅ الدالة المفقودة: تم إضافتها هنا
// Get order by ID
const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email')
      .populate('package', 'name price')
      .populate('mentor', 'name');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 4. Update order status (Admin only)
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      if (req.body.status) {
        order.status = req.body.status;
      }
      if (req.body.paymentStatus) {
        order.paymentStatus = req.body.paymentStatus;
      }
      
      const updatedOrder = await order.save();
      res.json({ success: true, order: updatedOrder });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// 5. Cancel order
const cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'الطلب غير موجود' });
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'غير مخول لإلغاء هذا الطلب' });
    }

    if (order.status === 'completed' || order.status === 'cancelled') {
      return res.status(400).json({ message: 'لا يمكن إلغاء هذا الطلب' });
    }

    order.status = 'cancelled';
    await order.save();

    res.json({
      success: true,
      message: 'تم إلغاء الطلب بنجاح',
      order
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في إلغاء الطلب' });
  }
};

// 6. Get all orders (Admin only)
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name phone email')
      .populate('package', 'name price')
      .populate('mentor', 'name title')
      .sort({ createdAt: -1 })
      .lean(); // .lean() لتحسين الأداء وإرجاع كائنات JavaScript عادية

    // تحويل البيانات إلى شكل مسطح وأسهل للعرض في الواجهة الأمامية
    const formattedOrders = orders.map(order => ({
      ...order,
      fullName: order.customerInfo?.name || order.user?.name,
      email: order.customerInfo?.email || order.user?.email,
      phone: order.customerInfo?.phone || order.user?.phone,
      major: order.orderDetails?.major || order.major,
      currentLevel: order.orderDetails?.currentLevel || order.currentLevel,
      interests: order.orderDetails?.interests || order.interests || [],
      goals: order.orderDetails?.goals || order.goals,
      timeline: order.orderDetails?.timeline || order.timeline,
      challenges: order.orderDetails?.challenges || order.challenges,
      preferredTime: order.orderDetails?.preferredTime || order.preferredTime,
      sessionType: order.orderDetails?.sessionType || order.sessionType,
      additionalNotes: order.orderDetails?.additionalNotes || order.additionalNotes,
      paymentMethod: order.paymentMethod,
    }));

    res.json({ success: true, orders: formattedOrders }); // إرسال البيانات المنسقة

  } catch (error) {
    console.error("Error in getAllOrders:", error);
    res.status(500).json({ success: false, message: 'خطأ في جلب الطلبات' });
  }
};

// ✅ إرجاع طلبات المرشد الحالي
const getMentorOrders = async (req, res) => {
  try {
    // تأكد إنه مرشد
    if (!req.user || req.user.role !== 'mentor') {
      return res.status(403).json({
        success: false,
        message: 'غير مصرح لك بالوصول إلى هذه البيانات'
      });
    }

    // نجيب المرشد من جدول mentors حسب الإيميل
    const mentorDoc = await Mentor.findOne({ email: req.user.email });

    if (!mentorDoc) {
      // ما في Mentor مرتبط بهذا الإيميل
      return res.json({
        success: true,
        orders: []
      });
    }

    // نجيب الطلبات اللي mentor = _id تبع جدول mentors
    const orders = await Order.find({
      mentor: mentorDoc._id,
      status: { $in: ['confirmed', 'completed'] } // لو حابة بس المؤكدة والمكتملة
    })
      .populate('user', 'name email phone')
      .populate('mentor', 'name email')
      .populate('package', 'name price')
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      orders
    });
  } catch (error) {
    console.error('Error in getMentorOrders:', error);
    return res.status(500).json({
      success: false,
      message: 'حدث خطأ أثناء جلب طلبات المرشد'
    });
  }
};


// ✅ تصدير جميع الدوال معًا في نهاية الملف
module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder,
  getAllOrders,
  getMentorOrders, // ✅ أضيفيه هنا
};
