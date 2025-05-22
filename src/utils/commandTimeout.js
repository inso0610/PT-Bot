const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const commandTimeout = new Schema({
    discordId: {
        type: String,
        required: true
    },
    command: {
        type: String,
        required: true
    },
    expiration: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('command-timeouts', commandTimeout, 'command-timeouts');