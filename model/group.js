const mongoose = require('mongoose')

module.exports = mongoose.model('Group', new mongoose.Schema({
    gc_name:  String,
    gc_admin: String
}))