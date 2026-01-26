const asyncHandler = require('express-async-handler');
const Order = require('../models/orderModel');
const { createLog } = require('./auditController');

// @desc    Create new order
// @route   POST /api/orders
// @access  Public
const addOrderItems = asyncHandler(async (req, res) => {
    const {
        orderItems,
        shippingAddress,
        totalPrice,
        guestName,
        guestPhone,
        userId,
        note
    } = req.body;

    if (orderItems && orderItems.length === 0) {
        res.status(400);
        throw new Error('No order items');
    } else {
        const order = new Order({
            orderItems,
            user: userId || null,
            guestName,
            guestPhone,
            shippingAddress,
            totalPrice,
            note
        });

        const createdOrder = await order.save();
        createLog(guestName || 'Khách Vãng Lai', 'Đặt Hàng', `Đã dặt đơn hàng #${createdOrder._id} trị giá ${totalPrice}`);
        res.status(201).json(createdOrder);
    }
});

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private (Admin)
const getOrders = asyncHandler(async (req, res) => {
    const orders = await Order.find({}).populate('user', 'id name');
    res.json(orders);
});

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Public
const getOrderById = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (order) {
        res.json(order);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        order.status = req.body.status || order.status;
        const updatedOrder = await order.save();
        createLog('Admin', 'Cập Nhật Đơn Hàng', `Đã cập nhật trạng thái đơn #${order._id} thành ${order.status}`);
        res.json(updatedOrder);
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private (Admin)
const deleteOrder = asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);

    if (order) {
        await order.deleteOne();
        res.json({ message: 'Order removed' });
    } else {
        res.status(404);
        throw new Error('Order not found');
    }
});

module.exports = {
    addOrderItems,
    getOrders,
    getOrderById,
    updateOrderStatus,
    deleteOrder
};
