const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  guestId: {
    type: String
  },
  text: { type: String, required: true },
  isBot: { type: Boolean, default: false },
}, {
  timestamps: true
});

module.exports = mongoose.model('ChatMessage', chatMessageSchema);