const asyncHandler = require('express-async-handler');
const Product = require('../models/productModel');
const { createLog } = require('./auditController');

// @desc    Get all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
    const pageSize = Number(req.query.pageSize) || 12; // Default 12 for list
    const page = Number(req.query.pageNumber) || 1;

    // Optional Keyword Search (future proofing)
    const keyword = req.query.keyword ? {
        name: {
            $regex: req.query.keyword,
            $options: 'i'
        }
    } : {};

    const count = await Product.countDocuments({ ...keyword });
    const products = await Product.find({ ...keyword })
        .limit(pageSize)
        .skip(pageSize * (page - 1));

    // Support both old array format and new object format for backward compatibility?
    // Actually, changing the response structure might break Homepage that expects array!
    // I should check `script.js` fetchProductsForHome.
    // fetchProductsForHome expects ARRAY: `const products = await res.json();` then `slice`.

    // To ensure compatibility, if `pageNumber` query exists, return object. Else return all array.
    if (req.query.pageNumber || req.query.pageSize) {
        res.json({ products, page, pages: Math.ceil(count / pageSize) });
    } else {
        // Return ALL for homepage (or limit to large number, or just as before)
        // But wait, if I use `find({ ...keyword })` without limit, it returns all.
        // Let's keep existing behavior if no query params.
        const allProducts = await Product.find({ ...keyword }).sort({ createdAt: -1 });
        res.json(allProducts);
    }
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        res.json(product);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, images, category, countInStock, isHot, weight, age, achievements, code } = req.body;

    const product = new Product({
        name,
        price,
        description,
        image,
        images: images || [image], // Fallback to single image if array not provided
        category,
        countInStock,
        isHot,
        weight,
        age,
        achievements,
        code
    });

    const createdProduct = await product.save();
    createLog('Admin', 'Thêm Chiến Kê', `Đã thêm gà mới: ${name} (${code})`);
    res.status(201).json(createdProduct);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = asyncHandler(async (req, res) => {
    const { name, price, description, image, images, category, countInStock, isHot, weight, age, achievements, code } = req.body;

    const product = await Product.findById(req.params.id);

    if (product) {
        product.name = name;
        product.price = price;
        product.description = description;
        product.image = image;
        if (images) product.images = images; // Update images if provided
        product.category = category;
        product.countInStock = countInStock;
        product.isHot = isHot;
        product.weight = weight;
        product.age = age;
        product.achievements = achievements;
        product.code = code;

        const updatedProduct = await product.save();
        createLog('Admin', 'Cập Nhật Chiến Kê', `Đã cập nhật gà: ${name} (${code})`);
        res.json(updatedProduct);
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);

    if (product) {
        await product.deleteOne(); // or remove() depending on Mongoose version, deleteOne is safer in newer
        createLog('Admin', 'Xóa Chiến Kê', `Đã xóa gà: ${product.name} (${product.code})`);
        res.json({ message: 'Product removed' });
    } else {
        res.status(404);
        throw new Error('Product not found');
    }
});

module.exports = {
    getProducts,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
};
