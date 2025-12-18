const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const connectDB = require('./src/config/database');
const authRoutes = require('./src/routes/auth');
const userRoutes = require('./src/routes/users');
const packageRoutes = require('./src/routes/packages');
const mentorRoutes = require('./src/routes/mentors');
const sessionRoutes = require('./src/routes/sessions');
const hollandRoutes = require('./src/routes/holland');
const aiPlanRoutes = require('./src/routes/aiPlan');
const adminRoutes = require('./src/routes/admin');
const orderRoutes = require('./src/routes/orders');
const formOptionsRoutes = require('./src/routes/formOptions');
const contentRoutes = require('./src/routes/content'); 
const cvRequestsRoutes = require('./src/routes/cvRequests'); // <-- ✅ أضف هذا السطر

const app = express();

// Connect to Database
connectDB();

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

// CORS configuration
app.use(cors({
  origin: ['http://localhost:5000', 'http://localhost:3000', 'http://127.0.0.1:5000', 'http://127.0.0.1:3000', 'http://127.0.0.1:5500'],
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// ❌ The unnecessary controller import should be removed
// const { updateOrderStatus } = require('./controllers/orderController'); 

// ❌ This app.use line was duplicated and should be removed from here
// app.use('/api/orders', orderRoutes); 

// Static files
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/holland', hollandRoutes);
app.use('/api/ai-plan', aiPlanRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/form-options', formOptionsRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/cv-requests', cvRequestsRoutes); // <-- ✅ أضف هذا السطر

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'حدث خطأ في الخادم', 
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'الصفحة غير موجودة' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});




module.exports = app;