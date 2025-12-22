const Subscription = require('../models/Subscription');

// @desc    Get user subscriptions
// @route   GET /api/subscriptions
// @access  Private
exports.getSubscriptions = async (req, res) => {
    try {
        const subscriptions = await Subscription.find({ user: req.user._id });
        res.json({ success: true, subscriptions });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update subscription status
// @route   PATCH /api/subscriptions/:id/status
// @access  Private
exports.updateSubscriptionStatus = async (req, res) => {
    try {
        const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user._id });
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        
        subscription.status = subscription.status === 'active' ? 'paused' : 'active';
        await subscription.save();
        
        res.json({ success: true, subscription });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
exports.deleteSubscription = async (req, res) => {
    try {
        const subscription = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }
        res.json({ success: true, message: 'Subscription removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Create new subscription
// @route   POST /api/subscriptions
// @access  Private
exports.createSubscription = async (req, res) => {
    try {
        const { name, items, frequency, nextDelivery, price } = req.body;
        const subscription = await Subscription.create({
            user: req.user._id,
            name,
            items,
            frequency,
            nextDelivery,
            price
        });
        res.status(201).json({ success: true, subscription });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
exports.updateSubscription = async (req, res) => {
    try {
        const { name, items, frequency, nextDelivery, price } = req.body;
        const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user._id });

        if (!subscription) {
            return res.status(404).json({ message: 'Subscription not found' });
        }

        if (name) subscription.name = name;
        if (items) subscription.items = items;
        if (frequency) subscription.frequency = frequency;
        if (nextDelivery) subscription.nextDelivery = nextDelivery;
        if (price !== undefined) subscription.price = price;

        await subscription.save();
        res.json({ success: true, subscription });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};