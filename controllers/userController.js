const Address = require('../models/Address');
const Notification = require('../models/Notification');

// @desc    Get user addresses
// @route   GET /api/users/addresses
// @access  Private
exports.getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id });
        res.json({ success: true, addresses });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Get user notifications
// @route   GET /api/users/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, notifications });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Add new address
// @route   POST /api/users/addresses
// @access  Private
exports.addAddress = async (req, res) => {
    try {
        const { name, street, city, state, zip, phone, isDefault } = req.body;
        
        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        const address = await Address.create({
            user: req.user._id,
            name,
            street,
            city,
            state,
            zip,
            phone,
            isDefault: isDefault || false
        });

        res.status(201).json({ success: true, address });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Update address
// @route   PUT /api/users/addresses/:id
// @access  Private
exports.updateAddress = async (req, res) => {
    try {
        const { name, street, city, state, zip, phone, isDefault } = req.body;
        const address = await Address.findOne({ _id: req.params.id, user: req.user._id });

        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }

        if (isDefault) {
            await Address.updateMany({ user: req.user._id }, { isDefault: false });
        }

        address.name = name || address.name;
        address.street = street || address.street;
        address.city = city || address.city;
        address.state = state || address.state;
        address.zip = zip || address.zip;
        address.phone = phone || address.phone;
        if (isDefault !== undefined) address.isDefault = isDefault;

        await address.save();
        res.json({ success: true, address });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Delete address
// @route   DELETE /api/users/addresses/:id
// @access  Private
exports.deleteAddress = async (req, res) => {
    try {
        const address = await Address.findOneAndDelete({ _id: req.params.id, user: req.user._id });
        if (!address) {
            return res.status(404).json({ message: 'Address not found' });
        }
        res.json({ success: true, message: 'Address removed' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};