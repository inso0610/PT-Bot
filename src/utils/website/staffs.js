const { secondaryConnection } = require('./websiteDatabase');
const { Schema } = require('mongoose');

const staffSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    rank: {
        type: String,
        required: true
    },
    lastLogin: {
        type: Date,
        default: Date.now()
    },
    email: {
        type: String,
        required: true
    },
    discordId: {
        type: String,
        required: true
    },
    PP: {
        type: Boolean,
        required: true
    }
});

module.exports = secondaryConnection.model('staffs', staffSchema);
