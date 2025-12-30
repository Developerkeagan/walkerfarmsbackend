const User = require('../models/User');
const SubscriptionPlan = require('../models/SubscriptionPlan');
const Subscription = require('../models/Subscription');

// @desc    Get all user subscriptions (admin view)
// @route   GET /api/admin/subscriptions
// @access  Private/Admin
const getAllSubscriptions = async (req, res) => {
  try {
    const { status, plan, limit = 50, skip = 0 } = req.query;

    let filter = {};
    if (status && status !== 'all') {
      filter.status = status;
    }
    if (plan && plan !== 'all') {
      filter.plan = plan;
    }

    const subscriptions = await Subscription.find(filter)
      .populate('user', 'name email')
      .populate('plan', 'name price interval')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Subscription.countDocuments(filter);

    res.json({
      success: true,
      subscriptions,
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

// @desc    Create subscription for user (admin)
// @route   POST /api/admin/subscriptions
// @access  Private/Admin
const createSubscription = async (req, res) => {
  try {
    const { userId, planId, status = 'active' } = req.body;

    // Validate user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Validate plan exists
    const plan = await SubscriptionPlan.findById(planId);
    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    // Check if user already has this subscription
    const existingSubscription = await Subscription.findOne({
      user: userId,
      plan: planId,
      status: { $in: ['active', 'paused'] }
    });

    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        message: 'User already has an active subscription to this plan'
      });
    }

    const subscription = new Subscription({
      user: userId,
      plan: planId,
      status,
      startDate: new Date(),
      nextBilling: new Date(Date.now() + (plan.interval === 'year' ? 365 : 30) * 24 * 60 * 60 * 1000)
    });

    const createdSubscription = await subscription.save();
    const populatedSubscription = await Subscription.findById(createdSubscription._id)
      .populate('user', 'name email')
      .populate('plan', 'name price interval');

    res.status(201).json({
      success: true,
      subscription: populatedSubscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update user subscription
// @route   PUT /api/admin/subscriptions/:id
// @access  Private/Admin
const updateSubscription = async (req, res) => {
  try {
    const { status, planId } = req.body;

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    if (status) subscription.status = status;
    if (planId) {
      const plan = await SubscriptionPlan.findById(planId);
      if (!plan) {
        return res.status(404).json({
          success: false,
          message: 'Subscription plan not found'
        });
      }
      subscription.plan = planId;
    }

    await subscription.save();

    const updatedSubscription = await Subscription.findById(req.params.id)
      .populate('user', 'name email')
      .populate('plan', 'name price interval');

    res.json({
      success: true,
      subscription: updatedSubscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Cancel user subscription
// @route   DELETE /api/admin/subscriptions/:id
// @access  Private/Admin
const cancelSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Subscription not found'
      });
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();
    await subscription.save();

    res.json({
      success: true,
      message: 'Subscription cancelled successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get subscription statistics
// @route   GET /api/admin/subscriptions/stats
// @access  Private/Admin
const getSubscriptionStats = async (req, res) => {
  try {
    const totalSubscriptions = await Subscription.countDocuments();
    const activeSubscriptions = await Subscription.countDocuments({ status: 'active' });
    const cancelledSubscriptions = await Subscription.countDocuments({ status: 'cancelled' });

    // Calculate monthly revenue
    const activeSubs = await Subscription.find({ status: 'active' })
      .populate('plan', 'price interval');

    let monthlyRevenue = 0;
    activeSubs.forEach(sub => {
      if (sub.plan) {
        monthlyRevenue += sub.plan.price;
      }
    });

    // Get recent subscriptions
    const recentSubscriptions = await Subscription.find()
      .populate('user', 'name email')
      .populate('plan', 'name price')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      success: true,
      stats: {
        totalSubscriptions,
        activeSubscriptions,
        cancelledSubscriptions,
        monthlyRevenue,
        recentSubscriptions
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

// @desc    Get subscriptions by user
// @route   GET /api/admin/subscriptions/user/:userId
// @access  Private/Admin
const getUserSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find({ user: req.params.userId })
      .populate('plan', 'name price interval features')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptions
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
  getAllSubscriptions,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  getSubscriptionStats,
  getUserSubscriptions
};
