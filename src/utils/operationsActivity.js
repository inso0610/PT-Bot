const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const activitySchema = new Schema({
    discordId: {
        type: String,
        required: true
    },
    robloxId: {
        type: String,
        required: true
    },
    shifts: {
        type: Number,
        default: 0
    },
    trainings: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model('activity', activitySchema, 'activity');