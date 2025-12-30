const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  sender: {
    type: String,
    required: true,
    enum: ['user', 'admin']
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel'
  },
  senderModel: {
    type: String,
    required: true,
    enum: ['User', 'User'] // Admin is also a User
  },
  message: {
    type: String,
    required: true
  },
  messageType: {
    type: String,
    default: 'text',
    enum: ['text', 'image', 'file']
  },
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

const chatConversationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  userName: {
    type: String,
    required: true
  },
  userEmail: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['active', 'resolved', 'pending'],
    default: 'active'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  lastMessage: {
    type: String,
    default: ''
  },
  lastMessageTime: {
    type: Date,
    default: Date.now
  },
  unreadCount: {
    type: Number,
    default: 0
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  tags: [{
    type: String
  }],
  messages: [chatMessageSchema]
}, {
  timestamps: true
});

// Index for efficient queries
chatConversationSchema.index({ status: 1, lastMessageTime: -1 });
chatConversationSchema.index({ user: 1 });

module.exports = mongoose.model('ChatConversation', chatConversationSchema);
