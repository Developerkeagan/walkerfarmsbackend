const ChatMessage = require('../models/ChatMessage');
const ChatConversation = require('../models/ChatConversation');
const User = require('../models/User');

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

        // Create or find conversation
        let conversation;
        if (req.user) {
            conversation = await ChatConversation.findOne({
                user: req.user._id,
                status: { $in: ['active', 'pending'] }
            });
        } else {
            conversation = await ChatConversation.findOne({
                guestId: guestId,
                status: { $in: ['active', 'pending'] }
            });
        }

        if (!conversation) {
            // Create new conversation
            const user = req.user ? await User.findById(req.user._id) : null;
            conversation = new ChatConversation({
                user: req.user?._id,
                guestId: req.user ? undefined : guestId,
                userName: req.user ? user.name : `Guest ${guestId.slice(-4)}`,
                userEmail: req.user ? user.email : undefined,
                status: 'pending',
                lastMessage: text,
                lastMessageTime: new Date(),
                messages: []
            });
            await conversation.save();
        } else {
            // Update existing conversation
            conversation.lastMessage = text;
            conversation.lastMessageTime = new Date();
            conversation.status = 'active';
            await conversation.save();
        }

        // Create user message
        const userMessage = new ChatMessage({
            conversation: conversation._id,
            sender: req.user ? req.user._id : guestId,
            senderModel: req.user ? 'User' : 'Guest',
            message: text,
            messageType: 'text',
            read: false
        });
        await userMessage.save();

        // Add message to conversation
        conversation.messages.push(userMessage._id);
        await conversation.save();

        // Emit to admin room via Socket.IO
        if (global.io) {
            global.io.to('admin-room').emit('new-chat-message', {
                conversation: conversation._id,
                message: userMessage,
                userName: conversation.userName,
                userEmail: conversation.userEmail
            });
        }

        // For now, send a bot response, but in real implementation this would wait for admin
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
