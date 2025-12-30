const User = require('../models/User');
const Order = require('../models/Order');
const Product = require('../models/Product');
const ChatRequest = require('../models/ChatRequest');
const Category = require('../models/Category');
const cloudinary = require('cloudinary').v2;

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/stats
// @access  Private/Admin
exports.getAdminStats = async (req, res) => {
    try {
        const now = new Date();
        const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // 1. Total Counts
        const usersCount = await User.countDocuments();
        const ordersCount = await Order.countDocuments();
        const productsCount = await Product.countDocuments();

        // 2. Total Revenue
        const totalRevenueResult = await Order.aggregate([
            { $group: { _id: null, total: { $sum: "$totalPrice" } } }
        ]);
        const totalRevenue = totalRevenueResult.length > 0 ? totalRevenueResult[0].total : 0;

        // 3. Users Growth (Current Month vs Last Month)
        const currentMonthUsers = await User.countDocuments({
            createdAt: { $gte: startOfCurrentMonth }
        });
        const lastMonthUsers = await User.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });

        let usersPercentage = 0;
        if (lastMonthUsers > 0) {
            usersPercentage = ((currentMonthUsers - lastMonthUsers) / lastMonthUsers) * 100;
        } else if (currentMonthUsers > 0) {
            usersPercentage = 100;
        }

        // 4. Orders Growth (Current Month vs Last Month)
        const currentMonthOrders = await Order.countDocuments({
            createdAt: { $gte: startOfCurrentMonth }
        });
        const lastMonthOrders = await Order.countDocuments({
            createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth }
        });

        let ordersPercentage = 0;
        if (lastMonthOrders > 0) {
            ordersPercentage = ((currentMonthOrders - lastMonthOrders) / lastMonthOrders) * 100;
        } else if (currentMonthOrders > 0) {
            ordersPercentage = 100;
        }

        // 5. Recent Orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name email');

        // 6. Monthly Order Counts (Current Year)
        const currentYear = new Date().getFullYear();
        const monthlyOrders = await Order.aggregate([
            {
                $match: {
                    createdAt: {
                        $gte: new Date(currentYear, 0, 1),
                        $lte: new Date(currentYear, 11, 31, 23, 59, 59)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$createdAt" },
                    count: { $sum: 1 }
                }
            }
        ]);

        const monthlyOrderCounts = Array(12).fill(0);
        monthlyOrders.forEach(item => {
            monthlyOrderCounts[item._id - 1] = item.count;
        });

        res.status(200).json({
            success: true,
            stats: {
                usersCount,
                ordersCount,
                productsCount,
                totalRevenue,
                usersPercentage,
                ordersPercentage,
                monthlyOrderCounts
            },
            recentOrders
        });

    } catch (error) {
        console.error("Error fetching admin stats:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get All Orders (Admin View)
// @route   GET /api/admin/orders
// @access  Private/Admin
exports.getAllOrders = async (req, res) => {
    try {
        const { status, limit = 50, skip = 0 } = req.query;

        let filter = {};
        if (status && status !== 'all') {
            if (status === 'paid') {
                filter.isPaid = true;
            } else if (status === 'unpaid') {
                filter.isPaid = false;
            } else if (status === 'delivered') {
                filter.isDelivered = true;
            } else if (status === 'pending') {
                filter.isPaid = false;
                filter.isDelivered = false;
            } else if (status === 'shipped') {
                filter.isPaid = true;
                filter.isDelivered = false;
            }
        }

        const orders = await Order.find(filter)
            .populate('user', 'name email')
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(parseInt(skip));

        const total = await Order.countDocuments(filter);

        res.json({
            success: true,
            orders,
            total,
            pagination: {
                limit: parseInt(limit),
                skip: parseInt(skip),
                hasMore: total > parseInt(skip) + parseInt(limit)
            }
        });
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update Order Status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private/Admin
exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;

        const order = await Order.findById(req.params.id);
        if (!order) {
            return res.status(404).json({ success: false, message: "Order not found" });
        }

        if (status === 'paid') {
            order.isPaid = true;
            order.paidAt = new Date();
        } else if (status === 'delivered') {
            order.isDelivered = true;
            order.deliveredAt = new Date();
        } else if (status === 'shipped') {
            order.isPaid = true;
            order.paidAt = order.paidAt || new Date();
        } else if (status === 'processing') {
            // Processing status - order is being prepared
            order.isPaid = true;
            order.paidAt = order.paidAt || new Date();
        }

        await order.save();

        const updatedOrder = await Order.findById(req.params.id)
            .populate('user', 'name email');

        res.json({
            success: true,
            order: updatedOrder
        });
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get All Categories
// @route   GET /api/admin/categories
// @access  Private/Admin
exports.getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            categories
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Create Category
// @route   POST /api/admin/categories
// @access  Private/Admin
exports.createCategory = async (req, res) => {
    try {
        const { name, description } = req.body;
        let imageUrl = "";

        if (req.files && req.files.length > 0) {
            const file = req.files[0];
            const result = await new Promise((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    { resource_type: 'auto', folder: 'categories' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                uploadStream.end(file.buffer);
            });
            imageUrl = result.secure_url;
        }

        const category = new Category({
            name,
            description,
            image: imageUrl
        });

        const createdCategory = await category.save();
        res.status(201).json({ success: true, category: createdCategory });
    } catch (error) {
        console.error("Error creating category:", error);
        if (error.code === 11000) {
            return res.status(400).json({ success: false, message: "Category already exists" });
        }
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Delete Category
// @route   DELETE /api/admin/categories/:id
// @access  Private/Admin
exports.deleteCategory = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({ success: false, message: "Category not found" });
        }
        await category.deleteOne();
        res.status(200).json({ success: true, message: "Category deleted successfully" });
    } catch (error) {
        console.error("Error deleting category:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get Chat Requests
// @route   GET /api/admin/chat-requests
// @access  Private/Admin
exports.getChatRequests = async (req, res) => {
    try {
        const requests = await ChatRequest.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .populate('user', 'name email')
            .limit(10);

        res.status(200).json({
            success: true,
            requests
        });
    } catch (error) {
        console.error("Error fetching chat requests:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get all users for dropdown
// @route   GET /api/admin/users-list
// @access  Private/Admin
exports.getUsersList = async (req, res) => {
    try {
        const users = await User.find({}, 'name email').sort({ name: 1 });
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Error fetching users list:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Send Notification
// @route   POST /api/admin/send-notification
// @access  Private/Admin
exports.sendNotification = async (req, res) => {
    try {
        const { type, userId, title, message } = req.body;

        // Logic to send email/push notification would go here
        // For now, we'll just return success

        res.status(200).json({
            success: true,
            message: "Notification sent successfully"
        });
    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get User Demographics
// @route   GET /api/admin/demographics
// @access  Private/Admin
exports.getUserDemographics = async (req, res) => {
    try {
        // Aggregating based on 'country' field in User model
        // Note: Ensure your User model has a 'country' field, or adjust "$country" to "$address.country" etc.
        const demographics = await User.aggregate([
            {
                $group: {
                    _id: "$country", // Group by country field
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 } // Get top 5 countries
        ]);

        const totalUsers = await User.countDocuments();

        const data = demographics.map(item => ({
            country: item._id || 'Unknown',
            count: item.count,
            percentage: totalUsers > 0 ? Math.round((item.count / totalUsers) * 100) : 0
        }));

        res.status(200).json({ success: true, demographics: data });
    } catch (error) {
        console.error("Error fetching demographics:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get Admin Notifications
// @route   GET /api/admin/notifications
// @access  Private/Admin
exports.getNotifications = async (req, res) => {
    try {
        // Fetch pending chat requests
        const chatRequests = await ChatRequest.find({ status: 'pending' })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name');

        // Fetch recent orders
        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('user', 'name');

        const notifications = [
            ...chatRequests.map(req => ({
                id: req._id,
                type: 'chat',
                message: `New chat request from ${req.user?.name || 'User'}`,
                time: req.createdAt,
                read: false
            })),
            ...recentOrders.map(order => ({
                id: order._id,
                type: 'order',
                message: `New order placed by ${order.user?.name || 'Customer'}`,
                time: order.createdAt,
                read: false
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

        res.status(200).json({ success: true, notifications });
    } catch (error) {
        console.error("Error fetching notifications:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get All Users (Full Details)
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        console.error("Error fetching all users:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Delete User
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }
        await user.deleteOne();
        res.status(200).json({ success: true, message: "User deleted successfully" });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Get All Products
// @route   GET /api/admin/products
// @access  Private/Admin
exports.getAllProducts = async (req, res) => {
    try {
        const products = await Product.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            products
        });
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Delete Product
// @route   DELETE /api/admin/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }
        await product.deleteOne();
        res.status(200).json({ success: true, message: "Product deleted successfully" });
    } catch (error) {
        console.error("Error deleting product:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Create Product
// @route   POST /api/admin/products
// @access  Private/Admin
exports.createProduct = async (req, res) => {
    try {
        const { name, price, category, stock, description } = req.body;
        let imageUrls = [];

        // Upload images to Cloudinary if files exist
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { resource_type: 'auto', folder: 'products' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    );
                    uploadStream.end(file.buffer);
                });
            });
            imageUrls = await Promise.all(uploadPromises);
        }

        const product = new Product({
            name,
            price,
            category,
            stock,
            description,
            images: imageUrls
        });
        const createdProduct = await product.save();
        res.status(201).json({ success: true, product: createdProduct });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};

// @desc    Update Product
// @route   PUT /api/admin/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res) => {
    try {
        const { name, price, category, stock, description } = req.body;
        let imageUrls = [];

        const product = await Product.findById(req.params.id);
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Upload new images to Cloudinary if files exist
        if (req.files && req.files.length > 0) {
            const uploadPromises = req.files.map(file => {
                return new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { resource_type: 'auto', folder: 'products' },
                        (error, result) => {
                            if (error) reject(error);
                            else resolve(result.secure_url);
                        }
                    );
                    uploadStream.end(file.buffer);
                });
            });
            imageUrls = await Promise.all(uploadPromises);
        }

        // Update product fields
        product.name = name || product.name;
        product.price = price !== undefined ? price : product.price;
        product.category = category || product.category;
        product.stock = stock !== undefined ? stock : product.stock;
        product.description = description !== undefined ? description : product.description;

        // Add new images to existing ones if any
        if (imageUrls.length > 0) {
            product.images = [...product.images, ...imageUrls];
        }

        const updatedProduct = await product.save();
        res.status(200).json({ success: true, product: updatedProduct });
    } catch (error) {
        console.error("Error updating product:", error);
        res.status(500).json({ success: false, message: "Server Error" });
    }
};
