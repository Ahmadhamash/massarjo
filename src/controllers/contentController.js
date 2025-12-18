const Content = require('../models/Content');

exports.getContent = async (req, res) => {
  try {
    const { sectionName } = req.params;
    
    let content = await Content.findOne({ sectionName });
    
    if (!content) {
      content = await createDefaultContent(sectionName);
    }
    
    res.json({
      success: true,
      data: content
    });
  } catch (error) {
    console.error('Error fetching content:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب المحتوى',
      error: error.message
    });
  }
};

exports.getAllContent = async (req, res) => {
  try {
    let contents = await Content.find({});
    
    if (contents.length === 0) {
      contents = await initializeDefaultContent();
    }
    
    const contentMap = {};
    contents.forEach(item => {
      contentMap[item.sectionName] = item.content;
    });
    
    res.json({
      success: true,
      data: contentMap
    });
  } catch (error) {
    console.error('Error fetching all content:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في جلب المحتوى',
      error: error.message
    });
  }
};

exports.updateContent = async (req, res) => {
  try {
    const { sectionName } = req.params;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        message: 'المحتوى مطلوب'
      });
    }
    
    const updatedContent = await Content.findOneAndUpdate(
      { sectionName },
      { content, updatedAt: Date.now() },
      { new: true, upsert: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'تم تحديث المحتوى بنجاح',
      data: updatedContent
    });
  } catch (error) {
    console.error('Error updating content:', error);
    res.status(500).json({
      success: false,
      message: 'حدث خطأ في تحديث المحتوى',
      error: error.message
    });
  }
};

async function createDefaultContent(sectionName) {
  const defaultContents = {
    hero: {
      title: 'ارسم مستقبلك بوضوح',
      subtitle: 'اكتشف ميولك واختر التخصص المناسب مع أدوات ذكية وإرشاد احترافي',
      badges: [
        { text: 'تحليل نفسي', icon: 'brain' },
        { text: 'خطة ذكية', icon: 'rocket' },
        { text: 'إرشاد مباشر', icon: 'users' }
      ]
    },
    howItWorks: {
      steps: [
        {
          number: '01',
          title: 'اكتشف ميولك',
          description: 'أجب على اختبار هولاند المهني لتحديد شخصيتك المهنية',
          icon: 'compass'
        },
        {
          number: '02',
          title: 'احصل على خطة ذكية',
          description: 'الذكاء الاصطناعي يصمم لك مسار تعليمي مخصص حسب أهدافك',
          icon: 'chart-line'
        },
        {
          number: '03',
          title: 'تواصل مع خبير',
          description: 'جلسات إرشادية مع متخصصين في مجالك لضمان النجاح',
          icon: 'graduation-cap'
        }
      ]
    },
    achievements: {
      stats: [
        {
          number: '2000+',
          label: 'مستخدم',
          icon: 'users'
        },
        {
          number: '500+',
          label: 'جلسة إرشادية',
          icon: 'calendar-check'
        },
        {
          number: '50+',
          label: 'محتوى تعليمي',
          icon: 'book-open'
        }
      ]
    },
    services: {
      tabs: [
        {
          id: 'holland',
          title: 'اختبار هولاند',
          points: [
            'تحليل شامل للشخصية المهنية',
            'تقرير مفصل يحدد ميولك واهتماماتك',
            'توصيات دقيقة للتخصصات المناسبة',
            'نتائج موثوقة ومعترف بها عالمياً'
          ],
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800'
        },
        {
          id: 'ai-plan',
          title: 'مخطط المسار الذكي',
          points: [
            'خطة تعليمية مخصصة بالذكاء الاصطناعي',
            'أفضل الدورات والمنصات التعليمية',
            'مسار واضح خطوة بخطوة',
            'محدث باستمرار حسب سوق العمل'
          ],
          image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800'
        },
        {
          id: 'mentorship',
          title: 'جلسات الإرشاد',
          points: [
            'خبراء متخصصون في مجالك',
            'جلسات فردية ومخصصة لك',
            'إرشاد عملي ونصائح قيمة',
            'متابعة ودعم مستمر'
          ],
          image: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800'
        }
      ]
    },
    testimonials: [
      {
        name: 'محمد أحمد',
        role: 'طالب جامعي',
        text: 'ساعدني اختبار هولاند على اكتشاف ميولي الحقيقية، وبفضل الجلسات الإرشادية اخترت تخصصي المناسب بثقة.',
        rating: 5,
        avatar: 'https://ui-avatars.com/api/?name=محمد+أحمد&background=6366f1&color=fff'
      },
      {
        name: 'فاطمة سالم',
        role: 'خريجة ثانوية',
        text: 'المخطط الذكي أعطاني خارطة طريق واضحة للوصول لأهدافي. أفضل استثمار لمستقبلي!',
        rating: 5,
        avatar: 'https://ui-avatars.com/api/?name=فاطمة+سالم&background=8b5cf6&color=fff'
      },
      {
        name: 'عبدالله خالد',
        role: 'باحث عن عمل',
        text: 'الإرشاد المهني كان دقيق جداً، وساعدني على فهم نقاط قوتي وتوجيهها بشكل صحيح.',
        rating: 5,
        avatar: 'https://ui-avatars.com/api/?name=عبدالله+خالد&background=ec4899&color=fff'
      }
    ]
  };

  const content = new Content({
    sectionName,
    content: defaultContents[sectionName] || {}
  });
  
  await content.save();
  return content;
}

async function initializeDefaultContent() {
  const sections = ['hero', 'howItWorks', 'achievements', 'services', 'testimonials'];
  const contents = [];
  
  for (const section of sections) {
    const content = await createDefaultContent(section);
    contents.push(content);
  }
  
  return contents;
}
