const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const generateCareerPlan = async (specialty) => {
  try {
    const prompt = `
    أنشئ خطة تعليمية شاملة باللغة العربية لتعلم: ${specialty}

    يجب أن تتضمن الخطة:
    1. دورات مقترحة (مع روابط وهمية للتوضيح)
    2. خارطة طريق مرحلية
    3. توصيات عامة

    قدم الإجابة بتنسيق JSON بالشكل التالي:
    {
      "courses": [
        {
          "title": "عنوان الدورة",
          "description": "وصف الدورة",
          "provider": "مقدم الدورة",
          "url": "https://example.com",
          "duration": "المدة",
          "level": "المستوى",
          "price": "السعر"
        }
      ],
      "roadmap": [
        {
          "phase": "المرحلة الأولى",
          "title": "عنوان المرحلة", 
          "description": "وصف المرحلة",
          "duration": "المدة",
          "skills": ["مهارة 1", "مهارة 2"]
        }
      ],
      "recommendations": ["نصيحة 1", "نصيحة 2"]
    }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "أنت مستشار مهني خبير في التعليم والتدريب. تقدم خطط تعليمية مفصلة وعملية."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 2000,
      temperature: 0.7
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content);
  } catch (error) {
    console.error('Error generating career plan:', error);
    
    // Fallback response
    return {
      courses: [
        {
          title: `دورة أساسيات ${specialty}`,
          description: `تعلم الأساسيات المهمة في مجال ${specialty}`,
          provider: "منصة تعليمية",
          url: "https://example.com",
          duration: "4 أسابيع",
          level: "مبتدئ",
          price: "مجاني"
        }
      ],
      roadmap: [
        {
          phase: "المرحلة الأولى",
          title: "تعلم الأساسيات",
          description: `ابدأ بتعلم المفاهيم الأساسية في ${specialty}`,
          duration: "شهر واحد",
          skills: ["المفاهيم الأساسية", "التطبيق العملي"]
        }
      ],
      recommendations: [
        "ابدأ بالأساسيات قبل الانتقال للمواضيع المتقدمة",
        "طبق ما تتعلمه من خلال مشاريع عملية"
      ]
    };
  }
};

module.exports = {
  generateCareerPlan
};