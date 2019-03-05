const mongoose = require('mongoose')

module.exports = mongoose.model('GC', new mongoose.Schema({
    gc_name: String,
    message: String,
    timestamp: {
        type: Date,
        default: Date.now()
    },
    sender: String
}))