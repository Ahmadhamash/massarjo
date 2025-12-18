const FormOptions = require('../models/FormOptions');

exports.getFieldOptions = async (req, res) => {
  try {
    const { fieldName } = req.params;
    const fieldOptions = await FormOptions.findOne({ fieldName });

    if (!fieldOptions) {
      return res.status(404).json({
        success: false,
        message: 'الحقل غير موجود'
      });
    }

    res.json({
      success: true,
      options: fieldOptions.options.sort((a, b) => a.order - b.order)
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب الخيارات',
      error: error.message
    });
  }
};

exports.getAllFormOptions = async (req, res) => {
  try {
    const allOptions = await FormOptions.find();
    
    const formattedOptions = {};
    allOptions.forEach(field => {
      formattedOptions[field.fieldName] = {
        label: field.label,
        options: field.options.sort((a, b) => a.order - b.order)
      };
    });

    res.json({
      success: true,
      formOptions: formattedOptions
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في جلب جميع الخيارات',
      error: error.message
    });
  }
};

exports.updateFieldOptions = async (req, res) => {
  try {
    const { fieldName } = req.params;
    const { label, options } = req.body;

    if (!options || !Array.isArray(options)) {
      return res.status(400).json({
        success: false,
        message: 'يجب إرسال الخيارات كمصفوفة'
      });
    }

    const updatedField = await FormOptions.findOneAndUpdate(
      { fieldName },
      {
        fieldName,
        label,
        options: options.map((opt, index) => ({
          value: opt.value,
          label: opt.label,
          order: opt.order !== undefined ? opt.order : index
        })),
        updatedAt: Date.now()
      },
      { upsert: true, new: true }
    );

    res.json({
      success: true,
      message: 'تم تحديث الخيارات بنجاح',
      field: updatedField
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تحديث الخيارات',
      error: error.message
    });
  }
};

exports.initializeDefaultOptions = async (req, res) => {
  try {
    const defaultOptions = [
      {
        fieldName: 'stepMajor',
        label: 'التخصص/المجال الحالي',
        options: [
          { value: 'scientific', label: 'علمي', order: 0 },
          { value: 'literary', label: 'أدبي', order: 1 },
          { value: 'it', label: 'تكنولوجيا المعلومات', order: 2 },
          { value: 'business', label: 'إدارة الأعمال', order: 3 },
          { value: 'engineering', label: 'هندسة', order: 4 },
          { value: 'health', label: 'علوم صحية', order: 5 },
          { value: 'other', label: 'أخرى', order: 6 }
        ]
      },
      {
        fieldName: 'stepCurrentLevel',
        label: 'المستوى الدراسي الحالي',
        options: [
          { value: 'high-school', label: 'ثانوية عامة', order: 0 },
          { value: 'fresh-graduate', label: 'خريج جديد', order: 1 },
          { value: 'university', label: 'طالب جامعي', order: 2 },
          { value: 'working', label: 'موظف', order: 3 },
          { value: 'career-change', label: 'أبحث عن تغيير مهني', order: 4 }
        ]
      },
      {
        fieldName: 'stepTimeline',
        label: 'الإطار الزمني',
        options: [
          { value: 'immediate', label: 'فوراً (خلال شهر)', order: 0 },
          { value: 'short-term', label: 'قريب (1-3 أشهر)', order: 1 },
          { value: 'medium-term', label: 'متوسط (3-6 أشهر)', order: 2 },
          { value: 'long-term', label: 'طويل (أكثر من 6 أشهر)', order: 3 }
        ]
      },
      {
        fieldName: 'stepPreferredTime',
        label: 'الوقت المفضل للجلسة',
        options: [
          { value: 'morning', label: 'صباحاً (8 ص - 12 م)', order: 0 },
          { value: 'afternoon', label: 'بعد الظهر (12 م - 4 م)', order: 1 },
          { value: 'evening', label: 'مساءً (4 م - 8 م)', order: 2 },
          { value: 'night', label: 'ليلاً (8 م - 11 م)', order: 3 }
        ]
      },
      {
        fieldName: 'stepSessionType',
        label: 'طريقة الجلسة المفضلة',
        options: [
          { value: 'video', label: 'جلسة فيديو (Zoom)', order: 0 },
          { value: 'audio', label: 'جلسة صوتية', order: 1 },
          { value: 'chat', label: 'محادثة نصية', order: 2 }
        ]
      }
    ];

    for (const field of defaultOptions) {
      await FormOptions.findOneAndUpdate(
        { fieldName: field.fieldName },
        field,
        { upsert: true, new: true }
      );
    }

    res.json({
      success: true,
      message: 'تم تهيئة الخيارات الافتراضية بنجاح'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'خطأ في تهيئة الخيارات',
      error: error.message
    });
  }
};
