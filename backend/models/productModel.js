const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    code: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true // 'ga-noi', 'ga-tre'
    },
    price: {
        type: Number, // 0 for 'Liên hệ' logic logic if needed, or use String
        required: false
    },
    description: {
        type: String,
        required: true
    },
    weight: String,
    age: String,
    achievements: String,
    image: {
        type: String, // URL to image
        required: true
    },
    images: [{
        type: String
    }],
    isHot: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Product', productSchema);
