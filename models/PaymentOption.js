const mongoose = require('mongoose');

const paymentOptionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['card', 'bank_transfer']
  },
  enabled: {
    type: Boolean,
    default: true
  },
  // For card payments
  cardConfig: {
    acceptedCards: [{
      type: String,
      enum: ['visa', 'mastercard', 'amex', 'discover']
    }],
    processingFee: {
      type: Number,
      default: 0
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  // For bank transfers
  bankDetails: {
    accountName: {
      type: String
    },
    accountNumber: {
      type: String
    },
    bankName: {
      type: String
    },
    routingNumber: {
      type: String
    },
    swiftCode: {
      type: String
    }
  },
  transactions: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('PaymentOption', paymentOptionSchema);
