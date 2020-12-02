const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Email is invalid!')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('password cannot contain the word "password"')
            }
        }
    },
    profileImage: {
        type: String,
    },
    admin:{
        type: Boolean,
        default: false
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
})

// //virtual ==> used to link another model (that are not a property in this model)
// userSchema.virtual('places', { //anyname ==> the virual property name (like owner in the otherhand)
//     ref: 'Place', //the other model name
//     localField: '_id',
//     foreignField: 'ownerID' //the two fields that are the same (equal)
// })

// //virtual ==> used to link another model (that are not a property in this model)
// userSchema.virtual('places', { //anyname ==> the virual property name (like owner in the otherhand)
//     ref: 'Place', //the other model name
//     localField: 'name',
//     foreignField: 'ownerName' //the two fields that are the same (equal)
// })

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens
    delete userObject.avatar

    return userObject
}

//methods ==> for methods on single user
userSchema.methods.createAuthToken = async function () {
    const user = this
    const token = await jwt.sign({ _id: user._id.toString() }, "thisismysecret")
    user.tokens = user.tokens.concat({ token })
    return token
}

//statics ==> for methods on the entire User model
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if(!user) throw new Error('unable to login!')

    const isMatched = await bcrypt.compare(password, user.password)
    if(!isMatched) throw new Error('unable to login!')

    return user
}

//Hash the plain text password before saving
userSchema.pre('save', async function (next) {
    const user = this
    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8) //hash the password
    }
    next()
})

// //delete user tasks when user is removed
// userSchema.pre('remove', async function (next) {
//     const user = this
//     await Task.deleteMany({ ownerID: user._id })
//     next()
// })

const User = mongoose.model('User', userSchema)

module.exports = User