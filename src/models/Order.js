// src/models/Order.js

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    package: {
        type: Schema.Types.ObjectId,
        ref: 'Package',
        required: true
    },
    packageName: String,
    packagePrice: Number,
    mentor: {
        type: Schema.Types.ObjectId,
        ref: 'Mentor'
    },
    mentorName: String,
    
    customerInfo: {
        name: { type: String, required: true },
        phone: { type: String, required: true },
        email: { type: String, required: true },
    },
    
    orderDetails: {
        // الخطوة 2: التخصص والاهتمامات
        major: String,
        currentLevel: String,
        interests: [String],
        
        // الخطوة 3: الأهداف والتطلعات
        goals: String,
        timeline: String,
        challenges: String,
        
        // الخطوة 4: تفضيلات الجلسة
        preferredTime: String,
        sessionType: String,
        additionalNotes: String,
        
        // للتوافق مع الكود القديم
        notes: String,
    },
    
    totalAmount: {
        type: Number,
        required: true
    },
    paymentMethod: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'completed', 'cancelled'],
        default: 'pending'
    },
    paymentStatus: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Order', OrderSchema);