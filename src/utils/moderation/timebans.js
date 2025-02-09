const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const modlogSchema = new Schema({
    discordId: {
        type: String,
        required: true
    },
    modlogId: {
        type: String,
        required: true
    },
    expiration: {
        type: Date,
        required: true
    },
});

module.exports = mongoose.model('time-bans', modlogSchema);