const express = require('express');
const router = express.Router();
const { getAddresses, addAddress, updateAddress, deleteAddress, getNotifications } = require('../controllers/userController');
const { getPaymentMethods, addPaymentMethod, deletePaymentMethod } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.get('/addresses', protect, getAddresses);
router.post('/addresses', protect, addAddress);
router.put('/addresses/:id', protect, updateAddress);
router.delete('/addresses/:id', protect, deleteAddress);

router.get('/notifications', protect, getNotifications);

router.get('/payment-methods', protect, getPaymentMethods);
router.post('/payment-methods', protect, addPaymentMethod);
router.delete('/payment-methods/:id', protect, deletePaymentMethod);

module.exports = router;