const express = require('express');
const router = express.Router();
const { getChatMessages } = require('../controllers/chatController');

router.route('/').get(getChatMessages);

module.exports = router;
