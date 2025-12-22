const express = require('express');
const router = express.Router();
const { getProducts, getProductReviews, getProductCategories, getProductsByIds } = require('../controllers/productController');

// @route   GET /api/products
router.get('/', getProducts);
router.get('/categories', getProductCategories);
router.post('/batch', getProductsByIds);
router.get('/:id/reviews', getProductReviews);

module.exports = router;