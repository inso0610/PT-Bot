const mongoose = require('mongoose');

const secondaryConnection = mongoose.createConnection(process.env.SECONDARY_URI);

module.exports = { secondaryConnection };
