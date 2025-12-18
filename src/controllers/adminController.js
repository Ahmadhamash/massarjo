// src/controllers/adminController.js

const User = require('../models/User');
const Order = require('../models/Order');
const Session = require('../models/Session');
const Package = require('../models/Package');
const Mentor = require('../models/Mentor');
const HollandResult = require('../models/HollandResult');
const AiPlan = require('../models/AiPlan');

// Helper: Calculate average response time
async function calculateAvgResponseTime() {
  try {
    const recentOrders = await Order.find({ status: 'confirmed' })
      .sort({ updatedAt: -1 })
      .limit(100);
    
    if (recentOrders.length === 0) return 0;
    
    let totalHours = 0;
    let count = 0;
    
    for (const order of recentOrders) {
      const diff = order.updatedAt - order.createdAt;
      const hours = diff / (1000 * 60 * 60);
      totalHours += hours;
      count++;
    }
    
    return count > 0 ? Math.round(totalHours / count) : 0;
  } catch (error) {
    return 0;
  }
}

// Dashboard statistics
const getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments({ role: 'user' });
    const totalOrders = await Order.countDocuments();
    const completedSessions = await Session.countDocuments({ status: 'completed' });
    const activeMentors = await Mentor.countDocuments({ status: 'active' });

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const monthlyRevenueData = await Order.aggregate([
      { 
        $match: { 
          paymentStatus: 'paid',
          createdAt: { $gte: startOfMonth }
        } 
      },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const monthlyRevenue = monthlyRevenueData[0]?.total || 0;

    const ratingsData = await Session.aggregate([
      { $match: { rating: { $exists: true, $ne: null } } },
      { $group: { _id: null, avgRating: { $avg: '$rating' }, count: { $sum: 1 } } }
    ]);
    const avgRating = ratingsData[0]?.avgRating || 0;
    const satisfactionRate = (avgRating / 5) * 100;

    const recentOrders = await Order.find()
      .populate('user', 'name email')
      .populate('package', 'name')
      .populate('mentor', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenueChart = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const avgResponseTime = await calculateAvgResponseTime();

    res.json({
      success: true,
      stats: {
        overview: {
          totalUsers,
          totalOrders,
          completedSessions,
          activeMentors,
          monthlyRevenue,
          satisfactionRate: Math.round(satisfactionRate),
          avgRating: avgRating.toFixed(1),
          avgResponseTime
        },
        recent: {
          orders: recentOrders,
        },
        chart: {
          monthlyRevenue: monthlyRevenueChart
        }
      }
    });
  } catch (error) {
    console.error('Error in getDashboardStats:', error);
    res.status(500).json({ success: false, message: 'خطأ في جلب إحصائيات لوحة التحكم' });
  }
};

// Get all users for admin
const getAllUsers = async (req, res) => {
  try {
    const filter = { role: 'user' };
    if (req.query.search) {
      filter.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { email: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    const users = await User.find(filter).select('-password').populate('orders').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب المستخدمين' });
  }
};

// Delete user
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        if (!user) {
             return res.status(404).json({ success: false, message: 'المستخدم غير موجود' });
        }
        if (user.role === 'admin') {
            return res.status(400).json({ success: false, message: 'لا يمكن حذف مستخدم مدير' });
        }
        await User.findByIdAndDelete(userId);
        res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في حذف المستخدم' });
    }
};

// --- Packages CRUD ---
const getAllPackages = async (req, res) => {
    try {
        const packages = await Package.find({}).populate('mentors');
        res.json({ success: true, packages });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في السيرفر' });
    }
};

// --- ✅✅✅ START: CORE FIX ✅✅✅ ---
// The following two functions have been corrected to properly handle the 'mentors' array.

// Corrected function to CREATE a package
const createPackage = async (req, res) => {
    try {
        // It now correctly expects 'name' and 'mentors'
        const { name, price, description, status, mentors } = req.body;
        
        const newPackage = new Package({
            name: name,
            price: price,
            description: description,
            status: status,
            mentors: mentors || [], // Accepts the mentors array, defaults to empty if not provided
            // Default values for other required fields in the schema
            features: description ? description.split(',').map(f => f.trim()) : ['ميزة جديدة'],
            category: 'student',
            duration: 30
        });

        await newPackage.save();
        res.status(201).json({
            success: true,
            message: 'تمت إضافة الباقة بنجاح',
            package: newPackage
        });
    } catch (error) {
        console.error("Error creating package:", error);
        res.status(500).json({ success: false, message: 'خطأ في إنشاء الباقة', error: error.message });
    }
};

// Corrected function to UPDATE a package
const updatePackage = async (req, res) => {
    try {
        // It now correctly expects 'name' and 'mentors' instead of 'packageName' and 'mentorIds'
        const { name, price, description, status, mentors } = req.body;
        
        const updatedPackageData = {
            name: name,
            price: price,
            description: description,
            status: status,
            mentors: mentors // This will now correctly update the mentors array
        };

        const pkg = await Package.findByIdAndUpdate(req.params.id, updatedPackageData, { new: true });

        if (!pkg) {
            return res.status(404).json({ success: false, message: 'الباقة غير موجودة' });
        }
        res.json({ success: true, message: 'تم تحديث الباقة بنجاح', package: pkg });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في تحديث الباقة', error: error.message });
    }
};

// --- ✅✅✅ END: CORE FIX ✅✅✅ ---

const deletePackage = async (req, res) => {
    try {
        const pkg = await Package.findByIdAndDelete(req.params.id);
        if (!pkg) {
            return res.status(404).json({ success: false, message: 'الباقة غير موجودة' });
        }
        res.json({ success: true, message: 'تم حذف الباقة بنجاح' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في السيرفر' });
    }
};

// --- Mentors CRUD ---
const getAllMentors = async (req, res) => {
    try {
        const mentors = await Mentor.find({}).sort({ createdAt: -1 });
        res.json({ success: true, mentors });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب المرشدين' });
    }
};

const createMentor = async (req, res) => {
    try {
        const { mentorName, mentorTitle, mentorAvatar, mentorEmail, mentorExperience, mentorSpecialty, mentorBio, mentorStatus } = req.body;
        if (!mentorName || !mentorTitle || !mentorEmail) {
            return res.status(400).json({ success: false, message: 'الرجاء إدخال جميع الحقول المطلوبة' });
        }
        const newMentor = new Mentor({
            name: mentorName,
            title: mentorTitle,
            avatar: mentorAvatar,
            email: mentorEmail,
            experience: mentorExperience,
            specialty: mentorSpecialty,
            bio: mentorBio || '',
            status: mentorStatus
        });
        await newMentor.save();
        res.status(201).json({ success: true, message: 'تمت إضافة المرشد بنجاح', mentor: newMentor });
     } catch (error) {
        console.error("DETAILED MENTOR CREATION ERROR:", error);
        res.status(500).json({
            success: false,
            message: `خطأ في الخادم: ${error.message}`,
            error: error.message
        });
    }
};

const updateMentor = async (req, res) => {
    try {
        const { mentorName, mentorTitle, mentorAvatar, mentorEmail, mentorExperience, mentorSpecialty, mentorBio, mentorStatus } = req.body;
        const mentorData = {
            name: mentorName,
            title: mentorTitle,
            avatar: mentorAvatar,
            email: mentorEmail,
            experience: mentorExperience,
            specialty: mentorSpecialty,
            bio: mentorBio || '',
            status: mentorStatus
        };
        const mentor = await Mentor.findByIdAndUpdate(req.params.id, mentorData, { new: true });
        if (!mentor) {
            return res.status(404).json({ success: false, message: 'المرشد غير موجود' });
        }
        res.json({ success: true, message: 'تم تحديث بيانات المرشد بنجاح', mentor });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في تحديث المرشد', error: error.message });
    }
};

const deleteMentor = async (req, res) => {
    try {
        const mentor = await Mentor.findByIdAndDelete(req.params.id);
        if (!mentor) {
            return res.status(404).json({ success: false, message: 'المرشد غير موجود' });
        }
        res.json({ success: true, message: 'تم حذف المرشد بنجاح' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في حذف المرشد' });
    }
};

// --- Orders CRUD ---
const getAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('user', 'name phone email')
      .populate('package', 'name price')
      .populate('mentor', 'name title')
      .populate('hollandResult')
      .sort({ createdAt: -1 })
      .lean();

    const formattedOrders = orders.map(order => ({
      ...order,
      fullName: order.customerInfo?.name || order.user?.name,
      email: order.customerInfo?.email || order.user?.email,
      phone: order.customerInfo?.phone || order.user?.phone,
      major: order.orderDetails?.major,
      currentLevel: order.orderDetails?.currentLevel,
      interests: order.orderDetails?.interests || [],
      goals: order.orderDetails?.goals,
      timeline: order.orderDetails?.timeline,
      challenges: order.orderDetails?.challenges,
      preferredTime: order.orderDetails?.preferredTime,
      sessionType: order.orderDetails?.sessionType,
      additionalNotes: order.orderDetails?.additionalNotes,
    }));

    res.json({ success: true, orders: formattedOrders });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب الطلبات' });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status, paymentStatus } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'الطلب غير موجود' });
    }
    
    res.json({ success: true, message: 'تم تحديث حالة الطلب', order });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث الطلب' });
  }
};

// --- Sessions CRUD ---
const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find({})
            .populate('user', 'name email')
            .populate('package', 'name price')
            .populate('mentor', 'name title');
        res.json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب الجلسات' });
    }
};

const createSession = async (req, res) => {
  try {
    const { userId, mentorId, scheduledDate, duration, title, price, userPhone } = req.body;
    
    if (!userId || !mentorId || !scheduledDate) {
      return res.status(400).json({ 
        success: false, 
        message: 'المستخدم، المرشد، والتاريخ مطلوبين' 
      });
    }
    
    const newSession = new Session({
      user: userId,
      mentor: mentorId,
      scheduledDate: new Date(scheduledDate),
      duration: duration || 60,
      title: title || 'جلسة إرشادية',
      price: price || 0,
      userPhone: userPhone || '',
      status: 'scheduled'
    });
    
    await newSession.save();
    
    const populatedSession = await Session.findById(newSession._id)
      .populate('user', 'name email')
      .populate('mentor', 'name title');
    
    res.status(201).json({ 
      success: true, 
      message: 'تمت إضافة الجلسة بنجاح', 
      session: populatedSession 
    });
  } catch (error) {
    console.error('Error creating session:', error);
    res.status(500).json({ success: false, message: 'خطأ في إضافة الجلسة' });
  }
};

const updateSession = async (req, res) => {
  try {
    const { userId, mentorId, scheduledDate, duration, title, price, userPhone, status } = req.body;
    
    const updateData = {};
    if (userId) updateData.user = userId;
    if (mentorId) updateData.mentor = mentorId;
    if (scheduledDate) updateData.scheduledDate = new Date(scheduledDate);
    if (duration) updateData.duration = duration;
    if (title) updateData.title = title;
    if (price !== undefined) updateData.price = price;
    if (userPhone) updateData.userPhone = userPhone;
    if (status) updateData.status = status;
    
    const session = await Session.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('user', 'name email').populate('mentor', 'name title');
    
    if (!session) {
      return res.status(404).json({ success: false, message: 'الجلسة غير موجودة' });
    }
    
    res.json({ success: true, message: 'تم تحديث الجلسة بنجاح', session });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في تحديث الجلسة' });
  }
};

const deleteSession = async (req, res) => {
  try {
    const session = await Session.findByIdAndDelete(req.params.id);
    if (!session) {
      return res.status(404).json({ success: false, message: 'الجلسة غير موجودة' });
    }
    res.json({ success: true, message: 'تم حذف الجلسة بنجاح' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في حذف الجلسة' });
  }
};

// Get analytics data
const getAnalytics = async (req, res) => {
  try {
    // Package distribution
    const packageDistribution = await Order.aggregate([
      { $group: { _id: '$packageName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    // Monthly revenue for chart
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyRevenue = await Order.aggregate([
      {
        $match: {
          paymentStatus: 'paid',
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    res.json({ 
      success: true, 
      analytics: {
        packageDistribution,
        monthlyRevenue
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'خطأ في جلب التحليلات' });
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  deleteUser,
  updateUserStatus: (req, res) => res.json({ success: true }), // Placeholder
  getAnalytics,
  getAllPackages,
  createPackage,
  updatePackage,
  deletePackage,
  getAllMentors,
  createMentor,
  updateMentor,
  deleteMentor,
  getAllSessions,
  getAllOrders,
  updateOrderStatus,
  createSession,
  updateSession,
  deleteSession
};