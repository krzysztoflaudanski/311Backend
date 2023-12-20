const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    login: { type: String, required: true, minlength: 10, maxlength: 50},
    password: { type: String, required: true, minlength: 8},
    phone: {type: Number, require: true, minlength: 9, maxlength: 25},
    avatar: { type: String}
});

module.exports = mongoose.model('User', userSchema);