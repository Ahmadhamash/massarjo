// src/controllers/sessionController.js
const Session = require('../models/Session');

// --- دوال خاصة بالمدير ---

// 1. جلب كل الجلسات (للوحة التحكم)
const getAllSessions = async (req, res) => {
    try {
        const sessions = await Session.find({})
            .populate('user', 'name phone')
            .populate('mentor', 'name')
            .sort({ scheduledDate: -1 });
        res.json({ success: true, sessions });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب الجلسات' });
    }
};

// 2. إنشاء جلسة جديدة
const createSession = async (req, res) => {
    try {
        const {
            sessionTitle, sessionUser, sessionUserPhone, sessionMentor,
            sessionDate, sessionDuration, sessionPrice, sessionStatus
        } = req.body;

        const newSession = new Session({
            title: sessionTitle,
            user: sessionUser,
            userPhone: sessionUserPhone,
            mentor: sessionMentor,
            scheduledDate: sessionDate,
            duration: sessionDuration,
            price: sessionPrice,
            status: sessionStatus
        });

        await newSession.save();
        res.status(201).json({ success: true, message: 'تم إنشاء الجلسة بنجاح' });
    } catch (error) {
        console.error("Error creating session:", error);
        res.status(500).json({ success: false, message: 'خطأ في إنشاء الجلسة', error: error.message });
    }
};

// 3. جلب بيانات جلسة واحدة (لغايات التعديل في لوحة التحكم)
const getSession = async (req, res) => {
    try {
        const session = await Session.findById(req.params.id)
            .populate('user', 'name phone')
            .populate('mentor', 'name');
            
        if (!session) {
            return res.status(404).json({ success: false, message: 'الجلسة غير موجودة' });
        }
        res.json({ success: true, session });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في جلب بيانات الجلسة' });
    }
};

// 4. تحديث بيانات جلسة كاملة (زر التعديل في لوحة التحكم)
const updateSession = async (req, res) => {
    try {
        const {
            sessionTitle, sessionUser, sessionUserPhone, sessionMentor,
            sessionDate, sessionDuration, sessionPrice, sessionStatus
        } = req.body;

        const updatedData = {
            title: sessionTitle,
            user: sessionUser,
            userPhone: sessionUserPhone,
            mentor: sessionMentor,
            scheduledDate: sessionDate,
            duration: sessionDuration,
            price: sessionPrice,
            status: sessionStatus
        };

        const session = await Session.findByIdAndUpdate(req.params.id, updatedData, { new: true });
        
        if (!session) {
            return res.status(404).json({ success: false, message: 'الجلسة غير موجودة' });
        }
        res.json({ success: true, message: 'تم تحديث الجلسة بنجاح', session });
    } catch (error) {
        console.error("Error updating session:", error);
        res.status(500).json({ success: false, message: 'خطأ في تحديث الجلسة' });
    }
};

// 5. تحديث حالة الجلسة فقط (من القائمة المنسدلة في الجدول)
const updateSessionStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const session = await Session.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (!session) {
            return res.status(404).json({ success: false, message: 'الجلسة غير موجودة' });
        }
        res.json({ success: true, message: 'تم تحديث حالة الجلسة', session });
    } catch (error) {
        res.status(500).json({ success: false, message: 'خطأ في تحديث الحالة' });
    }
};

// --- دوال خاصة بالمستخدم ---

// 6. جلب جلسات المستخدم الحالي (زر "جلساتي")
const getUserSessions = async (req, res) => {
    try {
        // req.user.id يأتي من التوكن (auth middleware)
        const sessions = await Session.find({ user: req.user.id })
            .populate('mentor', 'name title avatar') 
            .sort({ scheduledDate: -1 });

        res.json({ success: true, sessions });
    } catch (error) {
        console.error('Error fetching user sessions:', error);
        res.status(500).json({ success: false, message: 'خطأ في جلب الجلسات' });
    }
};

// 7. دوال إضافية (متروكة للمستقبل)
const addUserFeedback = async (req, res) => res.status(501).json({message: 'Not implemented'});
const cancelSession = async (req, res) => res.status(501).json({message: 'Not implemented'});

// --- تصدير الدوال ---
module.exports = {
    getAllSessions,
    createSession,
    getSession,          // تم تفعيلها
    updateSession,       // تم تفعيلها
    updateSessionStatus,
    getUserSessions,     // تم تفعيلها
    addUserFeedback,
    cancelSession
};