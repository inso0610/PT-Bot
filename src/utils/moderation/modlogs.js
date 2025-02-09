const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const modlogSchema = new Schema({
    discordId: {
        type: String,
        required: true
    },
    action: { // This is the type of action that was taken, like "ban", "kick", "mute", etc.
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
    doneAt: {
        type: Date,
        default: Date.now()
    }
});

module.exports = mongoose.model('modlogs', modlogSchema);