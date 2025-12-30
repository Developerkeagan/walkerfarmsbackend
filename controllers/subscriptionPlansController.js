const SubscriptionPlan = require('../models/SubscriptionPlan');

// @desc    Get all subscription plans
// @route   GET /api/admin/subscription-plans
// @access  Private/Admin
const getSubscriptionPlans = async (req, res) => {
  try {
    const subscriptionPlans = await SubscriptionPlan.find({}).sort({ createdAt: -1 });

    res.json({
      success: true,
      subscriptionPlans
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create a subscription plan
// @route   POST /api/admin/subscription-plans
// @access  Private/Admin
const createSubscriptionPlan = async (req, res) => {
  try {
    const { name, description, price, interval, features, popular } = req.body;

    // Check if subscription plan with this name already exists
    const existingPlan = await SubscriptionPlan.findOne({ name });
    if (existingPlan) {
      return res.status(400).json({
        success: false,
        message: 'Subscription plan with this name already exists'
      });
    }

    const subscriptionPlan = new SubscriptionPlan({
      name,
      description,
      price,
      interval,
      features,
      popular: popular || false
    });

    const createdPlan = await subscriptionPlan.save();

    res.status(201).json({
      success: true,
      subscriptionPlan: createdPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update a subscription plan
// @route   PUT /api/admin/subscription-plans/:id
// @access  Private/Admin
const updateSubscriptionPlan = async (req, res) => {
  try {
    const { name, description, price, interval, features, popular, enabled } = req.body;

    const subscriptionPlan = await SubscriptionPlan.findById(req.params.id);

    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    subscriptionPlan.name = name || subscriptionPlan.name;
    subscriptionPlan.description = description || subscriptionPlan.description;
    subscriptionPlan.price = price !== undefined ? price : subscriptionPlan.price;
    subscriptionPlan.interval = interval || subscriptionPlan.interval;
    subscriptionPlan.features = features || subscriptionPlan.features;
    subscriptionPlan.popular = popular !== undefined ? popular : subscriptionPlan.popular;
    subscriptionPlan.enabled = enabled !== undefined ? enabled : subscriptionPlan.enabled;

    const updatedPlan = await subscriptionPlan.save();

    res.json({
      success: true,
      subscriptionPlan: updatedPlan
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete a subscription plan
// @route   DELETE /api/admin/subscription-plans/:id
// @access  Private/Admin
const deleteSubscriptionPlan = async (req, res) => {
  try {
    const subscriptionPlan = await SubscriptionPlan.findById(req.params.id);

    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    await SubscriptionPlan.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Subscription plan deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Toggle subscription plan status
// @route   PATCH /api/admin/subscription-plans/:id/toggle
// @access  Private/Admin
const toggleSubscriptionPlan = async (req, res) => {
  try {
    const subscriptionPlan = await SubscriptionPlan.findById(req.params.id);

    if (!subscriptionPlan) {
      return res.status(404).json({
        success: false,
        message: 'Subscription plan not found'
      });
    }

    subscriptionPlan.enabled = !subscriptionPlan.enabled;
    await subscriptionPlan.save();

    res.json({
      success: true,
      subscriptionPlan
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
  getSubscriptionPlans,
  createSubscriptionPlan,
  updateSubscriptionPlan,
  deleteSubscriptionPlan,
  toggleSubscriptionPlan
};
