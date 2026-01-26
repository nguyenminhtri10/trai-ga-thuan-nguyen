const express = require('express');
const router = express.Router();
const { getProducts, createProduct, deleteProduct, getProductById, updateProduct } = require('../controllers/productController');

router.route('/').get(getProducts).post(createProduct);
router.route('/:id').get(getProductById).delete(deleteProduct).put(updateProduct);

module.exports = router;
