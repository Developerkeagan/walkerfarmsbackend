const mongoose = require('mongoose');

const subscriptionPlanSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  interval: {
    type: String,
    required: true,
    enum: ['month', 'year']
  },
  features: [{
    type: String,
    required: true
  }],
  popular: {
    type: Boolean,
    default: false
  },
  enabled: {
    type: Boolean,
    default: true
  },
  subscribers: {
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

module.exports = mongoose.model('SubscriptionPlan', subscriptionPlanSchema);
