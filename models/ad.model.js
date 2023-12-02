const mongoose = require('mongoose');

const adSchema = new mongoose.Schema({
    title: { type: String, required: true, minlength: 10, maxlength: 50 },
    content: { type: String, required: true, minlength: 20, maxlength: 1000 },
    publicationDate: { type: String, required: true },
    image: { type: String, required: true },
    price: { type: Number, required: true },
    location: { type: String, required: true },
    sellerInfo: {
        type: {
            username: {
                type: String,
                required: true
            },
            phone: {
                type: String,
                required: true
            }
        },
    }
});

module.exports = mongoose.model('Ad', adSchema);