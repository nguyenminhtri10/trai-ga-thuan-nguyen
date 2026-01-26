const mongoose = require('mongoose');

const orderSchema = mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            required: false, // Optional for guest orders
            ref: 'User',
        },
        guestName: { type: String },
        guestPhone: { type: String },
        orderItems: [
            {
                name: { type: String, required: true },
                qty: { type: Number, required: true, default: 1 },
                image: { type: String, required: true },
                price: { type: Number },
                product: {
                    type: mongoose.Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product',
                },
            },
        ],
        shippingAddress: {
            address: { type: String },
            city: { type: String },
        },
        totalPrice: {
            type: Number,
            required: true,
            default: 0.0,
        },
        isPaid: {
            type: Boolean,
            required: true,
            default: false,
        },
        paidAt: {
            type: Date,
        },
        status: {
            type: String,
            required: true,
            default: 'Đang xử lý', // Đang xử lý, Đang giao, Đã giao, Đã hủy
        },
        note: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
