const mongoose = require('mongoose');

const livestreamSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    description: {
        type: String
    }
}, {
    timestamps: true
});

const Livestream = mongoose.model('Livestream', livestreamSchema);

module.exports = Livestream;
