const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    login: { type: String, required: true, minlength: 10, maxlength: 50 },
    password: { type: String, required: true, minlength: 10},
    phone: {type: Number, require: true},
    avatar: { type: String}
});

module.exports = mongoose.model('User', userSchema);