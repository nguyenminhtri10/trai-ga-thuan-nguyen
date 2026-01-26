const express = require('express');
const router = express.Router();
const {
    addOrderItems,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder,
} = require('../controllers/orderController');

router.route('/').post(addOrderItems).get(getOrders);
router.route('/:id').get(getOrderById).delete(deleteOrder);
router.route('/:id/status').put(updateOrderStatus);

module.exports = router;
