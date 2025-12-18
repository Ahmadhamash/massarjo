const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('../models/User');
const Package = require('../models/Package');
const Mentor = require('../models/Mentor');

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);

    // إنشاء المدير
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL });
    if (!adminExists) {
      await User.create({
        name: 'مدير النظام',
        email: process.env.ADMIN_EMAIL,
        password: process.env.ADMIN_PASSWORD,
        role: 'admin'
      });
      console.log('✅ تم إنشاء حساب المدير');
    }

    // إنشاء الباقات الأولية
    const packagesCount = await Package.countDocuments();
    if (packagesCount === 0) {
      const packages = [
        {
          name: 'باقة الطالب',
          description: 'للطلاب الذين يبحثون عن التوجيه المهني',
          price: 299,
          features: ['جلسة إرشادية', 'تحليل الشخصية', 'خطة مهنية'],
          duration: 30,
          sessionsIncluded: 1,
          category: 'student'
        },
        {
          name: 'باقة المحترف',
          description: 'للمحترفين الذين يريدون تطوير مسارهم',
          price: 599,
          features: ['3 جلسات إرشادية', 'تحليل متقدم', 'متابعة شهرية'],
          duration: 60,
          sessionsIncluded: 3,
          category: 'professional'
        },
        {
          name: 'باقة الخريج',
          description: 'للخريجين الجدد للدخول في سوق العمل',
          price: 780,
          features: ['5 جلسات', 'إعداد السيرة الذاتية', 'تدريب على المقابلات'],
          duration: 90,
          sessionsIncluded: 5,
          category: 'graduate'
        }
      ];

      await Package.insertMany(packages);
      console.log('✅ تم إنشاء الباقات الأولية');
    }

    // إنشاء المرشدين الأوليين
    const mentorsCount = await Mentor.countDocuments();
    if (mentorsCount === 0) {
      const mentors = [
        {
          name: 'د. أحمد محمد',
          email: 'ahmed@masar.com',
          title: 'مستشار مهني أول',
          specialty: 'الهندسة والتكنولوجيا',
          experience: 10,
          bio: 'خبير في الإرشاد المهني مع أكثر من 10 سنوات خبرة'
        },
        {
          name: 'د. فاطمة أحمد',
          email: 'fatima@masar.com',
          title: 'مستشارة نفسية',
          specialty: 'علم النفس والإرشاد',
          experience: 8,
          bio: 'متخصصة في الإرشاد النفسي والمهني'
        }
      ];

      await Mentor.insertMany(mentors);
      console.log('✅ تم إنشاء المرشدين الأوليين');
    }

    console.log('✅ تم إعداد البيانات الأولية بنجاح');
    process.exit(0);
  } catch (error) {
    console.error('❌ خطأ في إعداد البيانات:', error);
    process.exit(1);
  }
};

seedData();