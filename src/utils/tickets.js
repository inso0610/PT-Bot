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
        default: 'COMMUNITY-ALL' //Departments: OPS-<ALL,DM,CM,PM,SM>, COMMUNITY-ALL (Standard), DEV-<ALL,AR,DEV,BOT,WEB>, MARKETING-<ALL,SOCIAL>, SENIOR-<ALL,SA,OM,DEV>
        //SPECIAL-RA, DIRECTOR-<ALL,MD,OD,ED>, ADVISOR-<ALL,GA,CA,GH>
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
});

module.exports = mongoose.model('tickets', ticketSchema);