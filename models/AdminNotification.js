const mongoose = require('mongoose');

const adminNotificationSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['order', 'payment', 'alert', 'ticket', 'user', 'system', 'promotion'],
    default: 'system'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  read: {
    type: Boolean,
    default: false
  },
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  readAt: {
    type: Date
  },
  // Reference to related entities
  relatedOrder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  relatedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  relatedProduct: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  },
  relatedTicket: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SupportTicket'
  },
  // For broadcast notifications
  isBroadcast: {
    type: Boolean,
    default: false
  },
  broadcastTo: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  metadata: {
    type: mongoose.Schema.Types.Mixed
  }
}, {
  timestamps: true
});

// Index for efficient queries
adminNotificationSchema.index({ type: 1, createdAt: -1 });
adminNotificationSchema.index({ read: 1, createdAt: -1 });
adminNotificationSchema.index({ priority: 1, createdAt: -1 });

module.exports = mongoose.model('AdminNotification', adminNotificationSchema);
