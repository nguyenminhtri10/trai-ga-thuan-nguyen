const mongoose = require('mongoose');

const auditLogSchema = mongoose.Schema({
    user: {
        type: String, // Store user name or ID. Since we have simple auth, storing Name is fine.
        required: true
    },
    action: {
        type: String,
        required: true
    },
    details: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
