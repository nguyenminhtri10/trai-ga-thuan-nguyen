const asyncHandler = require('express-async-handler');
const Livestream = require('../models/livestreamModel');
const { createLog } = require('./auditController');

// @desc    Get all livestream history
// @route   GET /api/livestreams
// @access  Public
const getLivestreams = asyncHandler(async (req, res) => {
    const livestreams = await Livestream.find({}).sort({ date: -1 });
    res.json(livestreams);
});

// @desc    Add new livestream to history
// @route   POST /api/livestreams
// @access  Private (Admin)
const addLivestream = asyncHandler(async (req, res) => {
    const { title, url, date, description } = req.body;

    const livestream = new Livestream({
        title,
        url,
        date: date || Date.now(),
        description
    });

    const createdLivestream = await livestream.save();
    createLog('Admin', 'Thêm LiveStream', `Đã thêm livestream: ${title}`);
    res.status(201).json(createdLivestream);
});

// @desc    Delete livestream history
// @route   DELETE /api/livestreams/:id
// @access  Private (Admin)
const deleteLivestream = asyncHandler(async (req, res) => {
    const livestream = await Livestream.findById(req.params.id);

    if (livestream) {
        await livestream.deleteOne();
        createLog('Admin', 'Xóa LiveStream', `Đã xóa livestream: ${livestream.title}`);
        res.json({ message: 'Livestream removed' });
    } else {
        res.status(404);
        throw new Error('Livestream not found');
    }
});

module.exports = {
    getLivestreams,
    addLivestream,
    deleteLivestream
};
