const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const deadChatSchema = new Schema({
    lastPing: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('deadChat', deadChatSchema, 'deadChat');