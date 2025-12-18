const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Send order confirmation email
const sendOrderConfirmation = async (order) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: order.user.email,
      subject: 'تأكيد طلبك - منصة مسار',
      html: `
        <div dir="rtl" style="font-family: 'Tajawal', Arial, sans-serif;">
          <h2>مرحباً ${order.user.name}</h2>
          <p>تم استلام طلبك بنجاح!</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>تفاصيل الطلب:</h3>
            <p><strong>رقم الطلب:</strong> ${order._id}</p>
            <p><strong>الباقة:</strong> ${order.package.name}</p>
            <p><strong>السعر:</strong> ${order.totalAmount} ريال</p>
            ${order.mentor ? `<p><strong>المرشد:</strong> ${order.mentor.name}</p>` : ''}
          </div>
          
          <p>سيتم التواصل معك قريباً لتأكيد الطلب وترتيب الجلسات.</p>
          
          <p>شكراً لثقتك في منصة مسار</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Order confirmation email sent to:', order.user.email);
  } catch (error) {
    console.error('Error sending order confirmation email:', error);
  }
};

// Send session reminder email
const sendSessionReminder = async (session) => {
  try {
    const sessionDate = new Date(session.scheduledDate);
    const formattedDate = sessionDate.toLocaleDateString('ar-SA');
    const formattedTime = sessionDate.toLocaleTimeString('ar-SA', {
      hour: '2-digit',
      minute: '2-digit'
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: session.user.email,
      subject: 'تذكير بموعد جلستك - منصة مسار',
      html: `
        <div dir="rtl" style="font-family: 'Tajawal', Arial, sans-serif;">
          <h2>مرحباً ${session.user.name}</h2>
          <p>تذكير بموعد جلستك الإرشادية</p>
          
          <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>تفاصيل الجلسة:</h3>
            <p><strong>المرشد:</strong> ${session.mentor.name}</p>
            <p><strong>التاريخ:</strong> ${formattedDate}</p>
            <p><strong>الوقت:</strong> ${formattedTime}</p>
            <p><strong>المدة:</strong> ${session.duration} دقيقة</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${session.meetingLink}" 
               style="background: #4f46e5; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              انضم للجلسة
            </a>
          </div>
          
          <p>يرجى الحضور في الموعد المحدد. في حالة عدم التمكن من الحضور، يرجى التواصل معنا.</p>
          
          <p>نتطلع للقائك!</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Session reminder email sent to:', session.user.email);
  } catch (error) {
    console.error('Error sending session reminder email:', error);
  }
};

// Send welcome email
const sendWelcomeEmail = async (user) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: user.email,
      subject: 'مرحباً بك في منصة مسار',
      html: `
        <div dir="rtl" style="font-family: 'Tajawal', Arial, sans-serif;">
          <h2>مرحباً ${user.name}</h2>
          <p>أهلاً بك في منصة مسار للإرشاد المهني!</p>
          
          <p>نحن سعداء بانضمامك إلينا. يمكنك الآن:</p>
          <ul>
            <li>إجراء مقياس هولاند للميول المهنية</li>
            <li>إنشاء خطة تعليمية ذكية</li>
            <li>حجز جلسات إرشادية مع خبراء</li>
            <li>الحصول على توجيه مهني شخصي</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="https://masar.com" 
               style="background: #4f46e5; color: white; padding: 15px 30px; 
                      text-decoration: none; border-radius: 8px; display: inline-block;">
              ابدأ رحلتك المهنية
            </a>
          </div>
          
          <p>إذا كان لديك أي استفسارات، لا تتردد في التواصل معنا.</p>
          
          <p>مع تحيات فريق مسار</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent to:', user.email);
  } catch (error) {
    console.error('Error sending welcome email:', error);
  }
};

module.exports = {
  sendOrderConfirmation,
  sendSessionReminder,
  sendWelcomeEmail
};