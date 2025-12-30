const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { getAdminStats, getChatRequests, getUsersList, sendNotification, getAllUsers, deleteUser, getUserDemographics, getNotifications, getAllProducts, deleteProduct, createProduct, updateProduct, getAllOrders, updateOrderStatus, getAllCategories, createCategory, deleteCategory } = require('../controllers/adminController');
const { getPaymentOptions, createPaymentOption, updatePaymentOption, deletePaymentOption, togglePaymentOption } = require('../controllers/paymentOptionsController');
const { getSubscriptionPlans, createSubscriptionPlan, updateSubscriptionPlan, deleteSubscriptionPlan, toggleSubscriptionPlan } = require('../controllers/subscriptionPlansController');
const { getChatConversations, getChatConversation, sendMessage, updateConversationStatus, markMessagesAsRead, getChatStats } = require('../controllers/chatConversationsController');
const { getAdminNotifications, createAdminNotification, sendBroadcastNotification, markNotificationAsRead, markAllNotificationsAsRead, deleteNotification, getNotificationStats, autoGenerateNotifications } = require('../controllers/adminNotificationsController');
const { getAllSubscriptions, createSubscription, updateSubscription, cancelSubscription, getSubscriptionStats, getUserSubscriptions } = require('../controllers/adminSubscriptionsController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getAdminStats);
router.get('/chat-requests', protect, admin, getChatRequests);
router.get('/users-list', protect, admin, getUsersList);
router.post('/send-notification', protect, admin, sendNotification);
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/demographics', protect, admin, getUserDemographics);
router.get('/notifications', protect, admin, getNotifications);
router.get('/products', protect, admin, getAllProducts);
router.delete('/products/:id', protect, admin, deleteProduct);
router.post('/products', protect, admin, upload.array('images', 5), createProduct);
router.put('/products/:id', protect, admin, upload.array('images', 5), updateProduct);
router.get('/orders', protect, admin, getAllOrders);
router.patch('/orders/:id/status', protect, admin, updateOrderStatus);
router.get('/categories', protect, admin, getAllCategories);
router.post('/categories', protect, admin, upload.array('image', 1), createCategory);
router.delete('/categories/:id', protect, admin, deleteCategory);

// Payment Options routes
router.get('/payment-options', protect, admin, getPaymentOptions);
router.post('/payment-options', protect, admin, createPaymentOption);
router.put('/payment-options/:id', protect, admin, updatePaymentOption);
router.delete('/payment-options/:id', protect, admin, deletePaymentOption);
router.patch('/payment-options/:id/toggle', protect, admin, togglePaymentOption);

// Subscription Plans routes
router.get('/subscription-plans', protect, admin, getSubscriptionPlans);
router.post('/subscription-plans', protect, admin, createSubscriptionPlan);
router.put('/subscription-plans/:id', protect, admin, updateSubscriptionPlan);
router.delete('/subscription-plans/:id', protect, admin, deleteSubscriptionPlan);
router.patch('/subscription-plans/:id/toggle', protect, admin, toggleSubscriptionPlan);

// Chat Conversations routes
router.get('/chat-conversations', protect, admin, getChatConversations);
router.get('/chat-conversations/stats', protect, admin, getChatStats);
router.get('/chat-conversations/:id', protect, admin, getChatConversation);
router.post('/chat-conversations/:id/messages', protect, admin, sendMessage);
router.patch('/chat-conversations/:id/status', protect, admin, updateConversationStatus);
router.patch('/chat-conversations/:id/read', protect, admin, markMessagesAsRead);

// Admin Notifications routes
router.get('/notifications/admin', protect, admin, getAdminNotifications);
router.get('/notifications/admin/stats', protect, admin, getNotificationStats);
router.post('/notifications/admin', protect, admin, createAdminNotification);
router.post('/notifications/admin/broadcast', protect, admin, sendBroadcastNotification);
router.post('/notifications/admin/auto-generate', protect, admin, autoGenerateNotifications);
router.patch('/notifications/admin/:id/read', protect, admin, markNotificationAsRead);
router.patch('/notifications/admin/mark-all-read', protect, admin, markAllNotificationsAsRead);
router.delete('/notifications/admin/:id', protect, admin, deleteNotification);

// Admin Subscriptions routes
router.get('/subscriptions', protect, admin, getAllSubscriptions);
router.get('/subscriptions/stats', protect, admin, getSubscriptionStats);
router.get('/subscriptions/user/:userId', protect, admin, getUserSubscriptions);
router.post('/subscriptions', protect, admin, createSubscription);
router.put('/subscriptions/:id', protect, admin, updateSubscription);
router.delete('/subscriptions/:id', protect, admin, cancelSubscription);

module.exports = router;
