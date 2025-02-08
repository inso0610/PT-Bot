const { boolean } = require('mathjs');
const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const ticketBlacklist = new Schema({
    discordId: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    addedBy: {
        type: String,
        required: true
    },
    expiration: {
        type: Date,
        required: true
    },
    permanent: {
        type: Boolean,
        required: true
    }
});

module.exports = mongoose.model('ticket-blacklist', ticketBlacklist, 'ticket-blacklist');