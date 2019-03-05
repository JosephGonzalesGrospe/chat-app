const mongoose = require('mongoose')

module.exports = mongoose.model('Personal', new mongoose.Schema({
    users_involve :  [String]
}))