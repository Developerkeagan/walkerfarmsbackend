const express = require('express');
const router = express.Router();
const { createTicket } = require('../controllers/supportController');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Optional auth middleware: Attaches user if token is valid, but doesn't block if not.
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

router.post('/tickets', optionalProtect, createTicket);

module.exports = router;