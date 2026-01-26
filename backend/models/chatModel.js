const mongoose = require('mongoose');

const chatSchema = mongoose.Schema({
    user: {
        type: String,
        required: true,
        default: 'Khách'
    },
    text: {
        type: String,
        required: true
    },
    livestream: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Livestream',
        required: false // Optional for now to support old messages or global chat
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

const ChatMessage = mongoose.model('ChatMessage', chatSchema);

module.exports = ChatMessage;
