const asyncHandler = require('express-async-handler');
const ChatMessage = require('../models/chatModel');

// @desc    Get recent chat messages
// @route   GET /api/chat
// @access  Public
const getChatMessages = asyncHandler(async (req, res) => {
    const { livestreamId } = req.query;

    let query = {};
    if (livestreamId) {
        query = { livestream: livestreamId };
    }

    // Get last 50 messages
    const messages = await ChatMessage.find(query).sort({ createdAt: -1 }).limit(50);
    // Reverse to show oldest first
    res.json(messages.reverse());
});

module.exports = {
    getChatMessages
};
