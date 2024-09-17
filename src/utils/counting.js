const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const countingSchema = new Schema({
    nextNumber: {
        type: Number,
        required: true
    },
    lastNumberSenderId: {
        type: String,
        default: '0'
    }
});

module.exports = mongoose.model('counting', countingSchema);