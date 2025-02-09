const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const warningSchema = new Schema({
    discordId: {
        type: String,
        required: true
    },
    reason: {
        type: String,
        required: true
    },
    moderatorId: {
        type: String,
        required: true
    },
    moderatorUsername: {
        type: String,
        required: true
    },
    addedAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('warnings', warningSchema);