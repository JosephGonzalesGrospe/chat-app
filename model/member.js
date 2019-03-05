const mongoose = require('mongoose')

module.exports = mongoose.model('GC_Members', new mongoose.Schema({
    gc_name: String,
    gc_member :  String,
    timestamp: {
        type: Date,
        default: Date.now()
    }
}))