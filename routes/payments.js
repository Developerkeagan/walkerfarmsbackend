const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Payment = require('../models/Payment');

// Get payment details (for user or admin)
router.get('/:id', protect, async (req, res) => {
    try {
        const payment = await Payment.findById(req.params.id).populate('user', 'name');
        if (!payment) return res.status(404).json({ message: 'Payment not found' });
        res.json({ success: true, payment });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;