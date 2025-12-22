const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a product name'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Please add a price'],
        min: 0
    },
    category: {
        type: String,
        required: [true, 'Please add a category'],
        trim: true
    },
    stock: {
        type: Number,
        required: [true, 'Please add stock quantity'],
        min: 0,
        default: 0
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    images: [{
        type: String
    }]
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

productSchema.virtual('id').get(function() {
    return this._id.toHexString();
});

productSchema.virtual('image').get(function() {
    return this.images && this.images.length > 0 ? this.images[0] : '';
});

module.exports = mongoose.model('Product', productSchema);