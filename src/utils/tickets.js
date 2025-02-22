const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const ticketSchema = new Schema({
    creatorId: {
        type: String,
        required: true
    },
    creatorUsername: {
        type: String,
        required: true
    },
    claimedId: {
        type: String,
        default: '0'
    },
    department: {
        type: String,
        default: 'COMMUNITY-ALL'
    },
    topic: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    comments: {
        type: String,
        required: true
    },
    importantNote: {
        type: String,
        default: 'No important note.'
    },
    notes: {
        type: Array,
        default: []
    },
    log: {
        type: Array,
        default: []
    },
    ticketMessageId: {
        type:String,
        required: true
    },
    language: {
        type:String,
        required: true
    },
    creationDate: {
        type: Date,
        default: Date.now()
    },
});

module.exports = mongoose.model('tickets', ticketSchema);