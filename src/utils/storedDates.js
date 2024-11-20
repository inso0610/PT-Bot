const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const dateSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    }
});

module.exports = mongoose.model('stored-dates', dateSchema);