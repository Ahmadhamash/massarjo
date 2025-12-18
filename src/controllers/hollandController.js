const HollandResult = require('../models/HollandResult');
const User = require('../models/User');
const { generateHollandAnalysis } = require('../utils/hollandAnalysis');

// Submit Holland assessment
const submitAssessment = async (req, res) => {
  try {
    const { answers } = req.body;
    const userId = req.user.id;

    // Calculate scores
    const scores = { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
    
    answers.forEach(answer => {
      if (answer.type && scores.hasOwnProperty(answer.type)) {
        scores[answer.type]++;
      }
    });

    // Find primary and secondary types
    const sortedScores = Object.entries(scores)
      .sort(([,a], [,b]) => b - a);
    
    const primaryType = sortedScores[0][0];
    const secondaryType = sortedScores[1][0];

    // Generate AI analysis
    const analysis = await generateHollandAnalysis(primaryType, secondaryType, scores);

    // Save result
    const hollandResult = await HollandResult.create({
      user: userId,
      answers,
      scores,
      primaryType,
      secondaryType,
      analysis
    });

    // Update user's Holland results
    await User.findByIdAndUpdate(userId, {
      $push: { hollandResults: hollandResult._id }
    });

    res.json({
      success: true,
      message: 'تم حفظ نتائج الاختبار بنجاح',
      result: hollandResult
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في حفظ نتائج الاختبار' });
  }
};

// Get user's Holland results
const getResults = async (req, res) => {
  try {
    const results = await HollandResult.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      results
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في جلب النتائج' });
  }
};

// Get Holland questions
const getQuestions = async (req, res) => {
  try {
    const questions = [
      // Realistic (R) Questions
      { text: "أستمتع بالعمل بيدي وإصلاح الأشياء", type: "R" },
      { text: "أحب العمل في الهواء الطلق", type: "R" },
      { text: "أفضل الأعمال العملية على النظرية", type: "R" },
      { text: "أستمتع بالعمل مع الآلات والأدوات", type: "R" },
      { text: "أحب بناء الأشياء بيدي", type: "R" },
      { text: "أفضل العمل الذي يتطلب مهارات جسدية", type: "R" },
      { text: "أستمتع بالأنشطة التي تتطلب قوة بدنية", type: "R" },
      { text: "أحب العمل مع النباتات والحيوانات", type: "R" },
      { text: "أفضل الوظائف التي لها نتائج ملموسة", type: "R" },
      { text: "أستمتع بأعمال الصيانة والإصلاح", type: "R" },

      // Investigative (I) Questions  
      { text: "أحب حل المشاكل المعقدة", type: "I" },
      { text: "أستمتع بالتجارب العلمية", type: "I" },
      { text: "أحب تحليل البيانات والمعلومات", type: "I" },
      { text: "أستمتع بالقراءة العلمية", type: "I" },
      { text: "أحب اكتشاف كيف تعمل الأشياء", type: "I" },
      { text: "أستمتع بالبحث والاستقصاء", type: "I" },
      { text: "أحب العمل مع الأرقام والإحصائيات", type: "I" },
      { text: "أستمتع بالتفكير النقدي", type: "I" },
      { text: "أحب دراسة الظواهر الطبيعية", type: "I" },
      { text: "أستمتع بحل الألغاز المنطقية", type: "I" },

      // Artistic (A) Questions
      { text: "أحب التعبير عن نفسي إبداعياً", type: "A" },
      { text: "أستمتع بالرسم أو التصميم", type: "A" },
      { text: "أحب الموسيقى والفنون", type: "A" },
      { text: "أستمتع بالكتابة الإبداعية", type: "A" },
      { text: "أحب الأعمال التي تتطلب خيالاً", type: "A" },
      { text: "أستمتع بالتصوير الفوتوغرافي", type: "A" },
      { text: "أحب تصميم الأشياء الجميلة", type: "A" },
      { text: "أستمتع بالأداء أمام الجمهور", type: "A" },
      { text: "أحب العمل في بيئة إبداعية", type: "A" },
      { text: "أستمتع بالابتكار والتجديد", type: "A" },

      // Social (S) Questions
      { text: "أحب مساعدة الآخرين", type: "S" },
      { text: "أستمتع بالعمل الجماعي", type: "S" },
      { text: "أحب تعليم الآخرين", type: "S" },
      { text: "أستمتع بالتطوع للأعمال الخيرية", type: "S" },
      { text: "أحب العمل مع الأطفال", type: "S" },
      { text: "أستمتع بحل مشاكل الناس", type: "S" },
      { text: "أحب تقديم المشورة للآخرين", type: "S" },
      { text: "أستمتع بالأنشطة المجتمعية", type: "S" },
      { text: "أحب رعاية المرضى أو كبار السن", type: "S" },
      { text: "أستمتع بتنظيم الفعاليات الاجتماعية", type: "S" },

      // Enterprising (E) Questions
      { text: "أحب قيادة الآخرين", type: "E" },
      { text: "أستمتع بالمفاوضات", type: "E" },
      { text: "أحب بدء مشاريع جديدة", type: "E" },
      { text: "أستمتع بالمنافسة", type: "E" },
      { text: "أحب إقناع الآخرين بآرائي", type: "E" },
      { text: "أستمتع بالمخاطرة المحسوبة", type: "E" },
      { text: "أحب العمل في المبيعات", type: "E" },
      { text: "أستمتع بإدارة الأعمال", type: "E" },
      { text: "أحب تحقيق الأهداف المالية", type: "E" },
      { text: "أستمتع بالتأثير في القرارات المهمة", type: "E" },

      // Conventional (C) Questions
      { text: "أحب العمل المنظم والمرتب", type: "C" },
      { text: "أستمتع بالأعمال المكتبية", type: "C" },
      { text: "أحب اتباع القواعد والإجراءات", type: "C" },
      { text: "أستمتع بتنظيم البيانات", type: "C" },
      { text: "أحب العمل مع التفاصيل", type: "C" },
      { text: "أستمتع بالأعمال الروتينية", type: "C" },
      { text: "أحب العمل في بيئة منظمة", type: "C" },
      { text: "أستمتع بالمحاسبة والأرقام", type: "C" },
      { text: "أحب إدخال البيانات وتسجيلها", type: "C" },
      { text: "أستمتع بالأعمال الإدارية المكتبية", type: "C" }
    ];

    res.json({
      success: true,
      questions: questions.map((q, index) => ({ ...q, id: index }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'خطأ في جلب الأسئلة' });
  }
};

module.exports = {
  submitAssessment,
  getResults,
  getQuestions
};