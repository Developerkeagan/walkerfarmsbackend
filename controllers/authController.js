const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const sendEmail = require('../utils/email'); // Import the email utility
const axios = require('axios'); // Import axios for IP-based geolocation
const crypto = require('crypto');

exports.register = async (req, res) => {
    try {
        const { name, email, password, phone } = req.body;
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, phone });
        const token = generateToken(user._id);

        // Send welcome email upon successful registration
        sendEmail({
                email: user.email,
                subject: 'Welcome to Walker Farms! 🌿',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                        <div style=" padding: 20px; text-align: center;">
                            <img src="https://i.imgur.com/OjUyMnH.png" alt="Walker Farms Logo" style="max-width: 150px;">
                        </div>
                        <div style="padding: 30px;">
                            <h1 style="font-size: 24px; font-weight: bold; color: #2c522d; margin-bottom: 20px;">Welcome, ${user.name}!</h1>
                            <p style="margin-bottom: 20px;">Thank you for joining Walker Farms. We're thrilled to have you as part of our community, dedicated to bringing fresh, organic produce from our fields to your table.</p>
                            <p style="margin-bottom: 25px;">You're all set to explore our range of products. Happy shopping!</p>
                            <a href="${process.env.FRONTEND_URL}" style="background-color: #4a7c59; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Start Shopping</a>
                        </div>
                        <div style="background-color: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #777;">
                            <p>You received this email because you signed up for an account at Walker Farms.</p>
                            <p>&copy; ${new Date().getFullYear()} Walker Farms Inc. All rights reserved.</p>
                        </div>
                    </div>
                `
            }).catch(emailError => console.error("Welcome email could not be sent:", emailError));

        res.status(201).json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = generateToken(user._id);

        // Send login notification email with IP and location
        (async () => {
          try {
            let ip = req.ip; // Get the user's IP address
            let location = 'Unknown';
            let displayIp = ip;

            // In a development environment, req.ip is often a loopback address (::1 or 127.0.0.1),
            // which cannot be geolocated. For demonstration purposes, we'll use a sample public IP.
            // In production, `req.ip` will be the actual user's IP, and this block will be skipped.
            if (ip === '::1' || ip === '127.0.0.1' || ip.startsWith('::ffff:')) {
                displayIp = ip; // Show the real local IP in the email
                ip = '8.8.8.8'; // Use a sample public IP for the geolocation API call
            }

            try {
                // Use a free Geo-IP service to get approximate location
                const geoResponse = await axios.get(`http://ip-api.com/json/${ip}?fields=city,regionName,country`);
                if (geoResponse.data) {
                    location = `${geoResponse.data.city}, ${geoResponse.data.regionName}, ${geoResponse.data.country}`;
                }
            } catch (geoError) {
                console.error("Could not fetch geolocation for IP:", ip, geoError.message);
            }

            await sendEmail({
                email: user.email,
                subject: 'Security Alert: New Login to Your Account',
                html: `
                    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                        <div style=" padding: 20px; text-align: center;">
                            <img src="https://i.imgur.com/OjUyMnH.png" alt="Walker Farms Logo" style="max-width: 150px;">
                        </div>
                        <div style="padding: 30px;">
                            <h1 style="font-size: 24px; font-weight: bold; color: #b94a48; margin-bottom: 20px;">Security Alert</h1>
                            <p style="margin-bottom: 20px;">Hi ${user.name},</p>
                            <p style="margin-bottom: 20px;">We detected a new login to your Walker Farms account. Here are the details:</p>
                            <div style="background-color: #f9f9f9; border-left: 4px solid #4a7c59; padding: 15px; margin-bottom: 25px; font-size: 14px;">
                                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                                <p><strong>IP Address:</strong> ${displayIp}</p>
                                <p><strong>Approximate Location:</strong> ${location}</p>
                            </div>
                            <p style="margin-bottom: 25px;">If this was you, you can safely ignore this email. If you don't recognize this activity, please secure your account immediately by changing your password.</p>
                            <a href="${process.env.FRONTEND_URL}/profile" style="background-color: #c9302c; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Secure Your Account</a>
                        </div>
                        <div style="background-color: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #777;">
                            <p>You received this email because of a login attempt on your account.</p>
                            <p>&copy; ${new Date().getFullYear()} Walker Farms Inc. All rights reserved.</p>
                        </div>
                    </div>
                `
            });
          } catch (emailError) { console.error("Login notification email could not be sent:", emailError); }
        })();

        res.json({ success: true, token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getMe = async (req, res) => {
    res.json({ success: true, user: req.user });
};

exports.updateProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.id, req.body, { new: true, runValidators: true });
        res.json({ success: true, user });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.forgotPassword = async (req, res) => {
    // Logic for forgot password (e.g., generate token, send email)
    res.status(200).json({ message: 'Password reset link sent (feature in development)' });
};

exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        // Find user and include password for comparison
        const user = await User.findById(req.user.id).select('+password');

        // Check if current password is correct
        if (!user || !(await user.matchPassword(currentPassword))) {
            return res.status(401).json({ message: 'Incorrect current password' });
        }

        // Set new password (pre-save hook will hash it)
        user.password = newPassword;
        await user.save();

        res.json({ success: true, message: 'Password updated successfully.' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.requestMagicLink = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found with that email' });
        }

        const magicToken = crypto.randomBytes(20).toString('hex');
        user.magicToken = crypto.createHash('sha256').update(magicToken).digest('hex');
        user.magicTokenExpiry = Date.now() + 3600000; // 1 hour

        await user.save({ validateBeforeSave: false });

        const magicLink = `${process.env.FRONTEND_URL}/magic-login/${magicToken}`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Your Magic Login Link for Walker Farms',
                html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; background-color: #ffffff;">
                    <div style=" padding: 20px; text-align: center;">
                        <img src="https://i.imgur.com/OjUyMnH.png" alt="Walker Farms Logo" style="max-width: 150px;">
                    </div>
                    <div style="padding: 30px;">
                        <h1 style="font-size: 24px; font-weight: bold; color: #2c522d; margin-bottom: 20px;">Magic Login Link</h1>
                        <p style="margin-bottom: 20px;">Click the link below to securely log in to your Walker Farms account without a password.</p>
                        <a href="${magicLink}" style="background-color: #4a7c59; color: #ffffff; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Login to Walker Farms</a>
                        <p style="margin-top: 20px; font-size: 12px; color: #777;">This link is valid for 1 hour. If you did not request this, please ignore this email.</p>
                    </div>
                    <div style="background-color: #f7f7f7; padding: 20px; text-align: center; font-size: 12px; color: #777;">
                        <p>You received this email because you requested a magic login link for your account.</p>
                        <p>&copy; ${new Date().getFullYear()} Walker Farms Inc. All rights reserved.</p>
                    </div>
                </div>
            `
            });
        } catch (emailError) {
            user.magicToken = undefined;
            user.magicTokenExpiry = undefined;
            await user.save({ validateBeforeSave: false });
            console.error("Magic link email could not be sent:", emailError);
            return res.status(500).json({ message: 'Could not send magic link email' });
        }

        res.status(200).json({ message: 'Magic link sent to your email' });
    } catch (err) {
        console.error("Error in requestMagicLink:", err);
        res.status(500).json({ message: 'Something went wrong' });
    }
};

exports.loginWithMagicLink = async (req, res) => {
    const { token } = req.params;

    try {
        const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            magicToken: hashedToken,
            magicTokenExpiry: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired magic link' });
        }

        const jwtToken = generateToken(user._id);

        user.magicToken = undefined;
        user.magicTokenExpiry = undefined;
        await user.save({ validateBeforeSave: false });

        res.json({ success: true, token: jwtToken, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
    } catch (err) {
        res.status(500).json({ message: 'Something went wrong during magic login' });
    }
};
