const Order = require('../models/Order');
const { sendOrderConfirmationEmail } = require('../utils/email');

/**
 * @desc    Create new order
 * @route   POST /api/orders
 * @access  Private
 */
exports.createOrder = async (req, res) => {
    try {
        const {
            orderItems,
            shippingAddress,
            paymentMethod,
            itemsPrice,
            taxPrice,
            shippingPrice,
            totalPrice,
        } = req.body;

        if (orderItems && orderItems.length === 0) {
            res.status(400).json({ message: 'No order items' });
            return;
        } else {
            const order = new Order({
                user: req.user._id,
                orderItems,
                shippingAddress,
                paymentMethod,
                itemsPrice,
                taxPrice,
                shippingPrice,
                totalPrice,
            });

            const createdOrder = await order.save();

            // Populate user data for email
            const populatedOrder = await Order.findById(createdOrder._id).populate('user', 'name email');

            // Send order confirmation email (non-blocking)
            sendOrderConfirmationEmail(populatedOrder).catch(err => {
                console.error('Failed to send order confirmation email:', err);
            });

            res.status(201).json({ success: true, order: createdOrder });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * @desc    Get logged in user orders
 * @route   GET /api/orders/myorders
 * @access  Private
 */
exports.getMyOrders = async (req, res) => {
    try {
        const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, orders });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * @desc    Get order by ID
 * @route   GET /api/orders/:id
 * @access  Private
 */
exports.getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id).populate('user', 'name email');
        if (order) {
            res.json({ success: true, order });
        } else {
            res.status(404).json({ message: 'Order not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
