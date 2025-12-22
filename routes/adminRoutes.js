const express = require('express');
const router = express.Router();
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });
const { getAdminStats, getChatRequests, getUsersList, sendNotification, getUserDemographics, getNotifications, getAllUsers, deleteUser, getAllProducts, deleteProduct, createProduct, getAllCategories, createCategory, deleteCategory } = require('../controllers/adminController');
// Assuming you have auth middleware in the middleware folder
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/stats', protect, admin, getAdminStats);
router.get('/chat-requests', protect, admin, getChatRequests);
router.get('/users-list', protect, admin, getUsersList);
router.post('/send-notification', protect, admin, sendNotification);
router.get('/demographics', protect, admin, getUserDemographics);
router.get('/notifications', protect, admin, getNotifications);
router.get('/users', protect, admin, getAllUsers);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/products', protect, admin, getAllProducts);
router.delete('/products/:id', protect, admin, deleteProduct);
router.post('/products', protect, admin, upload.array('images', 5), createProduct);
router.get('/categories', protect, admin, getAllCategories);
router.post('/categories', protect, admin, upload.array('image', 1), createCategory);
router.delete('/categories/:id', protect, admin, deleteCategory);

module.exports = router;