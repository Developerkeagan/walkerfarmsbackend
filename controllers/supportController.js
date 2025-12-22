const SupportTicket = require('../models/SupportTicket');

// @desc    Create a new support ticket
// @route   POST /api/support/tickets
// @access  Public
exports.createTicket = async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Generate a simple unique ticket ID
        const ticketId = `WF-${Date.now().toString().slice(-6)}`;

        const ticket = await SupportTicket.create({
            name,
            email,
            subject,
            message,
            ticketId,
            user: req.user ? req.user._id : null // Attach user if logged in
        });

        res.status(201).json({ success: true, ticket });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
};