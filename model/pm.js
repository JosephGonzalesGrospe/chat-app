const mongoose = require('mongoose')

module.exports = mongoose.model('PM', new mongoose.Schema({
    p_id: String,
    message: String,
    timestamp: {
        type: Date,
        default: Date.now()
    },
    sender: String
}))