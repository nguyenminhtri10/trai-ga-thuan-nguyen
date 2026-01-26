const express = require('express');
const router = express.Router();
const { getLivestreams, addLivestream, deleteLivestream } = require('../controllers/livestreamController');

router.route('/').get(getLivestreams).post(addLivestream);
router.route('/:id').delete(deleteLivestream);

module.exports = router;
