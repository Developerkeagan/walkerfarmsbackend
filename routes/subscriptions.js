const express = require('express');
const router = express.Router();
const { getSubscriptions, updateSubscriptionStatus, deleteSubscription, createSubscription, updateSubscription } = require('../controllers/subscriptionController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getSubscriptions);
router.post('/', protect, createSubscription);
router.put('/:id', protect, updateSubscription);
router.patch('/:id/status', protect, updateSubscriptionStatus);
router.delete('/:id', protect, deleteSubscription);

module.exports = router;