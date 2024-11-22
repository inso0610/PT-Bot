const mongoose = require('mongoose');
const { Schema } = require('mongoose');

const applicationSchema = new Schema({
    role: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    notes: {
        type: String,
        default: ''
    },
    status: {
        type: String,
        default: 'Closed' //Possible: Closed, Opening soon, Opening soon (Not Public), Open, Open (Not Public), Closing soon, Results out
    },
    results: {
        type: Object,
        default: {}
    }
});

/*
    results: {
        [userId]: {
            result: Pass/Fail,
            feedback: (Feedback)
        }
    }
*/

module.exports = mongoose.model('applications', applicationSchema);