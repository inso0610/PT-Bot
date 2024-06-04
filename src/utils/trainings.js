const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const trainingSchema = new Schema({
    hostDiscordId: {
        type: String,
        required: true
    },
    hostRobloxId: {
        type: String,
        required: true
    },
    hostRobloxUsername: {
        type: String,
        required: true
    },
    trainingType: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timestamp: {
        type: String,
        required: true
    },
    additionalInfo: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Scheduled'
    },
    server: {
        type: String,
        default: 'Training not started.'
    },
    teamupId: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('trainings', trainingSchema);