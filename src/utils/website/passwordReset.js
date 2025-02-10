const { secondaryConnection } = require('./websiteDatabase');
const { Schema } = require('mongoose');

const passwordResets = new Schema({
    email: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: {
        type: Date,
        required: true
    }
});

module.exports = secondaryConnection.model('passwordresets', passwordResets);