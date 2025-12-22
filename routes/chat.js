const express = require('express');
const router = express.Router();
const { getMessages, sendMessage } = require('../controllers/chatController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth middleware
const optionalProtect = async (req, res, next) => {
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            const token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
        } catch (error) {}
    }
    next();
};

router.get('/', optionalProtect, getMessages);
router.post('/', optionalProtect, sendMessage);

module.exports = router;