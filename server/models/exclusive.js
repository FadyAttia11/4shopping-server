const mongoose = require('mongoose')

const exclusiveSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
    exclusiveImage: {
        type: String,
        required: true
    }
}, {
    timestamps: true
})

const Exclusive = mongoose.model('Exclusive', exclusiveSchema)

module.exports = Exclusive