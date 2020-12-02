const mongoose = require('mongoose')

const testimonialSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    quote: {
        type: String,
        required: true,
        trim: true
    },
    testimonialImage: {
        type: String,
        required: true
    },
    rating: {
        type: Number
    }
}, {
    timestamps: true
})

const Testimonial = mongoose.model('Testimonial', testimonialSchema)

module.exports = Testimonial