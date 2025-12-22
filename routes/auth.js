const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    updateProfile,
    forgotPassword,
    updatePassword,
    requestMagicLink,
    loginWithMagicLink
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.post('/magic-login', requestMagicLink);
router.get('/magic-login/:token', loginWithMagicLink);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/update-password', protect, updatePassword);
router.post('/forgot-password', forgotPassword);

module.exports = router;