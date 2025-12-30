const AdminNotification = require('../models/AdminNotification');
const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const SupportTicket = require('../models/SupportTicket');

// @desc    Get all admin notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
const getAdminNotifications = async (req, res) => {
  try {
    const { type, read, limit = 50, skip = 0 } = req.query;

    let filter = {};
    if (type && type !== 'all') {
      filter.type = type;
    }
    if (read !== undefined) {
      filter.read = read === 'true';
    }

    const notifications = await AdminNotification.find(filter)
      .populate('relatedOrder', 'orderNumber totalPrice')
      .populate('relatedUser', 'name email')
      .populate('relatedProduct', 'name price')
      .populate('relatedTicket', 'subject status')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await AdminNotification.countDocuments(filter);

    res.json({
      success: true,
      notifications,
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

// @desc    Create a new admin notification
// @route   POST /api/admin/notifications
// @access  Private/Admin
const createAdminNotification = async (req, res) => {
  try {
    const { title, message, type, priority, relatedOrder, relatedUser, relatedProduct, relatedTicket, metadata } = req.body;

    const notification = new AdminNotification({
      title,
      message,
      type: type || 'system',
      priority: priority || 'medium',
      relatedOrder,
      relatedUser,
      relatedProduct,
      relatedTicket,
      metadata
    });

    const createdNotification = await notification.save();

    const populatedNotification = await AdminNotification.findById(createdNotification._id)
      .populate('relatedOrder', 'orderNumber totalPrice')
      .populate('relatedUser', 'name email')
      .populate('relatedProduct', 'name price')
      .populate('relatedTicket', 'subject status');

    res.status(201).json({
      success: true,
      notification: populatedNotification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Send broadcast notification to all users
// @route   POST /api/admin/notifications/broadcast
// @access  Private/Admin
const sendBroadcastNotification = async (req, res) => {
  try {
    const { title, message, type } = req.body;

    // Validate required fields
    if (!title || !message) {
      return res.status(400).json({
        success: false,
        message: 'Title and message are required'
      });
    }

    // Get user count for response
    const userCount = await User.countDocuments();

    const notification = new AdminNotification({
      title,
      message,
      type: type || 'system',
      priority: 'high',
      isBroadcast: true,
      metadata: {
        broadcastRecipients: userCount,
        sentAt: new Date()
      }
    });

    const createdNotification = await notification.save();

    // Here you could also send push notifications, emails, etc.
    // For now, we'll just create the admin notification

    res.status(201).json({
      success: true,
      notification: createdNotification,
      recipients: userCount,
      message: `Broadcast notification sent to ${userCount} users`
    });
  } catch (error) {
    console.error('Broadcast notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark notification as read
// @route   PATCH /api/admin/notifications/:id/read
// @access  Private/Admin
const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await AdminNotification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    notification.read = true;
    notification.readAt = new Date();
    // In a real app, you'd add the current admin user to readBy array

    await notification.save();

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Mark all notifications as read
// @route   PATCH /api/admin/notifications/mark-all-read
// @access  Private/Admin
const markAllNotificationsAsRead = async (req, res) => {
  try {
    const result = await AdminNotification.updateMany(
      { read: false },
      {
        read: true,
        readAt: new Date()
        // In a real app, you'd add the current admin user to readBy array
      }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} notifications marked as read`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a notification
// @route   DELETE /api/admin/notifications/:id
// @access  Private/Admin
const deleteNotification = async (req, res) => {
  try {
    const notification = await AdminNotification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await AdminNotification.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get notification statistics
// @route   GET /api/admin/notifications/stats
// @access  Private/Admin
const getNotificationStats = async (req, res) => {
  try {
    const stats = await AdminNotification.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          unreadCount: {
            $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] }
          }
        }
      }
    ]);

    const totalNotifications = await AdminNotification.countDocuments();
    const unreadNotifications = await AdminNotification.countDocuments({ read: false });
    const recentNotifications = await AdminNotification.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
    });

    res.json({
      success: true,
      stats: {
        totalNotifications,
        unreadNotifications,
        recentNotifications,
        typeBreakdown: stats
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

// @desc    Auto-generate notifications from system events
// @route   POST /api/admin/notifications/auto-generate
// @access  Private/Admin
const autoGenerateNotifications = async (req, res) => {
  try {
    const notifications = [];

    // Check for low stock products
    const lowStockProducts = await Product.find({ stock: { $lte: 10, $gt: 0 } });
    lowStockProducts.forEach(product => {
      notifications.push({
        title: 'Low Stock Alert',
        message: `${product.name} is running low on stock (${product.stock} units remaining)`,
        type: 'alert',
        priority: 'high',
        relatedProduct: product._id
      });
    });

    // Check for out of stock products
    const outOfStockProducts = await Product.find({ stock: 0 });
    outOfStockProducts.forEach(product => {
      notifications.push({
        title: 'Out of Stock Alert',
        message: `${product.name} is completely out of stock`,
        type: 'alert',
        priority: 'high',
        relatedProduct: product._id
      });
    });

    // Check for recent orders
    const recentOrders = await Order.find({
      createdAt: { $gte: new Date(Date.now() - 60 * 60 * 1000) } // Last hour
    }).populate('user', 'name');
    recentOrders.forEach(order => {
      notifications.push({
        title: 'New Order Received',
        message: `Order #${order.orderNumber} placed by ${order.user?.name || 'Customer'} for $${order.totalPrice}`,
        type: 'order',
        priority: 'medium',
        relatedOrder: order._id,
        relatedUser: order.user?._id
      });
    });

    // Create notifications
    const createdNotifications = await AdminNotification.insertMany(notifications);

    res.json({
      success: true,
      message: `Generated ${createdNotifications.length} notifications`,
      notifications: createdNotifications
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
  getAdminNotifications,
  createAdminNotification,
  sendBroadcastNotification,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  getNotificationStats,
  autoGenerateNotifications
};
