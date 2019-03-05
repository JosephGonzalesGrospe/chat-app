const mongoose = require('mongoose')

module.exports = mongoose.model('User', new mongoose.Schema({
    username: {
        type: String,
        required: true,
        minlength: 3
    },
    password: {
        type: String,
        required: true,
        minlength: 3
    }
}))