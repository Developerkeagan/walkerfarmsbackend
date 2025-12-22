const mongoose = require('mongoose');

const chatRequestSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    message: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'active', 'closed'],
        default: 'pending'
    }
}, { timestamps: true });

module.exports = mongoose.model('ChatRequest', chatRequestSchema);