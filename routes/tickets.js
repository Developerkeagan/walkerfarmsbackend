const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/auth');
const Ticket = require('../models/Ticket');

// Admin: Get all tickets
router.get('/', protect, admin, async (req, res) => {
    try {
        const tickets = await Ticket.find({}).populate('user', 'name email').sort({ createdAt: -1 });
        res.json({ success: true, tickets });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Add other ticket-related routes here (e.g., admin replying to a ticket)

module.exports = router;