const express = require('express');
const router = express.Router();
const { getLogs } = require('../controllers/auditController');

router.route('/').get(getLogs);

module.exports = router;
