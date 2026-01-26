const asyncHandler = require('express-async-handler');
const AuditLog = require('../models/auditLogModel');

// @desc    Get recent activity logs
// @route   GET /api/logs
// @access  Private (Admin)
const getLogs = asyncHandler(async (req, res) => {
    const logs = await AuditLog.find({}).sort({ timestamp: -1 }).limit(20);
    res.json(logs);
});

// Helper function to create log internally
// This is NOT an express middleware, but a function to be called by other controllers
const createLog = async (userName, action, details) => {
    try {
        await AuditLog.create({
            user: userName,
            action,
            details
        });
    } catch (error) {
        console.error('Failed to create audit log:', error);
    }
};

module.exports = {
    getLogs,
    createLog
};
