const Product = require('../models/Product');
const Rating = require('../models/Rating'); // Assuming a Rating model exists

/**
 * @desc    Fetch all products
 * @route   GET /api/products
 * @access  Public
 */
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json({ success: true, count: products.length, products });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

/**
 * @desc    Get reviews for a single product
 * @route   GET /api/products/:id/reviews
 * @access  Public
 */
exports.getProductReviews = async (req, res) => {
    try {
        const reviews = await Rating.find({ product: req.params.id })
            .populate('user', 'name') // Populate user's name from the User model
            .sort({ createdAt: -1 });

        res.json({ success: true, reviews });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

/**
 * @desc    Get all unique product categories
 * @route   GET /api/products/categories
 * @access  Public
 */
exports.getProductCategories = async (req, res) => {
    try {
        const categories = await Product.distinct('category');
        res.json({ success: true, categories });
    } catch (err) { res.status(500).json({ message: err.message }); }
};

/**
 * @desc    Fetch products by IDs
 * @route   POST /api/products/batch
 * @access  Public
 */
exports.getProductsByIds = async (req, res) => {
    try {
        const { ids } = req.body;
        const products = await Product.find({ _id: { $in: ids } });
        res.json({ success: true, products });
    } catch (err) { res.status(500).json({ message: err.message }); }
};