const ChatConversation = require('../models/ChatConversation');

// @desc    Get all chat conversations
// @route   GET /api/admin/chat-conversations
// @access  Private/Admin
const getChatConversations = async (req, res) => {
  try {
    const { status, limit = 50, skip = 0 } = req.query;

    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }

    const conversations = await ChatConversation.find(filter)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ lastMessageTime: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await ChatConversation.countDocuments(filter);

    res.json({
      success: true,
      conversations,
      total,
      pagination: {
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > parseInt(skip) + parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get single chat conversation with messages
// @route   GET /api/admin/chat-conversations/:id
// @access  Private/Admin
const getChatConversation = async (req, res) => {
  try {
    const conversation = await ChatConversation.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Chat conversation not found'
      });
    }

    res.json({
      success: true,
      conversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send message in chat conversation
// @route   POST /api/admin/chat-conversations/:id/messages
// @access  Private/Admin
const sendMessage = async (req, res) => {
  try {
    const { message, messageType = 'text' } = req.body;
    const conversationId = req.params.id;

    // Get admin user ID from token (assuming it's stored in req.user)
    const adminId = req.user._id;

    const conversation = await ChatConversation.findById(conversationId);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Chat conversation not found'
      });
    }

    // Add new message
    const newMessage = {
      sender: 'admin',
      senderId: adminId,
      senderModel: 'User',
      message,
      messageType,
      read: false
    };

    conversation.messages.push(newMessage);
    conversation.lastMessage = message;
    conversation.lastMessageTime = new Date();

    // If conversation was resolved, make it active again
    if (conversation.status === 'resolved') {
      conversation.status = 'active';
    }

    await conversation.save();

    // Populate the updated conversation
    const updatedConversation = await ChatConversation.findById(conversationId)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    // Emit message to user via Socket.IO
    if (global.io) {
      const roomId = conversation.user ? conversation.user.toString() : conversation.guestId;
      global.io.to(roomId).emit('admin-message', {
        conversation: conversation._id,
        message: newMessage,
        adminName: req.user.name
      });
    }

    res.status(201).json({
      success: true,
      message: newMessage,
      conversation: updatedConversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update conversation status
// @route   PATCH /api/admin/chat-conversations/:id/status
// @access  Private/Admin
const updateConversationStatus = async (req, res) => {
  try {
    const { status, priority, assignedTo, tags } = req.body;

    const conversation = await ChatConversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Chat conversation not found'
      });
    }

    if (status) conversation.status = status;
    if (priority) conversation.priority = priority;
    if (assignedTo) conversation.assignedTo = assignedTo;
    if (tags) conversation.tags = tags;

    await conversation.save();

    const updatedConversation = await ChatConversation.findById(req.params.id)
      .populate('user', 'name email')
      .populate('assignedTo', 'name email');

    res.json({
      success: true,
      conversation: updatedConversation
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark messages as read
// @route   PATCH /api/admin/chat-conversations/:id/read
// @access  Private/Admin
const markMessagesAsRead = async (req, res) => {
  try {
    const conversation = await ChatConversation.findById(req.params.id);

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: 'Chat conversation not found'
      });
    }

    // Mark all user messages as read
    conversation.messages.forEach(msg => {
      if (msg.sender === 'user' && !msg.read) {
        msg.read = true;
        msg.readAt = new Date();
      }
    });

    conversation.unreadCount = 0;

    await conversation.save();

    res.json({
      success: true,
      message: 'Messages marked as read'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get chat statistics
// @route   GET /api/admin/chat-conversations/stats
// @access  Private/Admin
const getChatStats = async (req, res) => {
  try {
    const stats = await ChatConversation.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalUnread: { $sum: '$unreadCount' }
        }
      }
    ]);

    const totalConversations = await ChatConversation.countDocuments();
    const activeChats = await ChatConversation.countDocuments({ status: 'active' });
    const onlineUsers = await ChatConversation.countDocuments({
      status: 'active',
      lastMessageTime: { $gte: new Date(Date.now() - 5 * 60 * 1000) } // Active in last 5 minutes
    });

    res.json({
      success: true,
      stats: {
        totalConversations,
        activeChats,
        onlineUsers,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = {
  getChatConversations,
  getChatConversation,
  sendMessage,
  updateConversationStatus,
  markMessagesAsRead,
  getChatStats
};
