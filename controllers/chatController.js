const ChatMessage = require('../models/ChatMessage');

// @desc    Get chat history
// @route   GET /api/chat
// @access  Public (with guestId) or Private
exports.getMessages = async (req, res) => {
    try {
        const query = {};
        if (req.user) {
            query.user = req.user._id;
        } else if (req.query.guestId) {
            query.guestId = req.query.guestId;
        } else {
            // Return empty if no identifier
            return res.json({ success: true, messages: [] });
        }

        const messages = await ChatMessage.find(query).sort({ createdAt: 1 });
        res.json({ success: true, messages });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Send a message
// @route   POST /api/chat
// @access  Public (with guestId) or Private
exports.sendMessage = async (req, res) => {
    try {
        const { text, guestId } = req.body;
        
        const messageData = { text, isBot: false };
        if (req.user) messageData.user = req.user._id;
        else messageData.guestId = guestId;

        const userMessage = await ChatMessage.create(messageData);

        // Generate Bot Response
        const botResponseData = {
            text: "Thanks for your message! One of our farm specialists will be with you shortly. In the meantime, feel free to browse our fresh produce!",
            isBot: true
        };
        if (req.user) botResponseData.user = req.user._id;
        else botResponseData.guestId = guestId;

        const botMessage = await ChatMessage.create(botResponseData);

        // Return both so frontend can display user msg immediately and bot msg with delay
        res.status(201).json({ success: true, messages: [userMessage, botMessage] });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};