const PaymentMethod = require('../models/PaymentMethod');

// @desc    Get user payment methods
// @route   GET /api/users/payment-methods
// @access  Private
exports.getPaymentMethods = async (req, res) => {
    try {
        const paymentMethods = await PaymentMethod.find({ user: req.user._id });
        res.json({ success: true, paymentMethods });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Add new payment method
// @route   POST /api/users/payment-methods
// @access  Private
exports.addPaymentMethod = async (req, res) => {
    try {
        const { cardType, last4, expiryMonth, expiryYear, isDefault, nameOnCard, zip } = req.body;

        if (isDefault) {
            await PaymentMethod.updateMany({ user: req.user._id }, { isDefault: false });
        }

        const paymentMethod = await PaymentMethod.create({
            user: req.user._id,
            cardType,
            last4,
            expiryMonth,
            expiryYear,
            nameOnCard,
            zip,
            isDefault: isDefault || false
        });

        res.status(201).json({ success: true, paymentMethod });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete payment method
// @route   DELETE /api/users/payment-methods/:id
// @access  Private
exports.deletePaymentMethod = async (req, res) => {
    try {
        const paymentMethod = await PaymentMethod.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!paymentMethod) {
            return res.status(404).json({ message: 'Payment method not found' });
        }
        res.json({ success: true, message: 'Payment method removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};