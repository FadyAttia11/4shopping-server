const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const itemRouter = require('./routers/item')
const cartRouter = require('./routers/cart')
const testimonialRouter = require('./routers/testimonial')
const exclusiveRouter = require('./routers/exclusive')
// const adminRouter = require('./routers/admin')

const app = express()

app.use(express.json()) //automatically parse the incoming json for us --> trasform it to object
app.use('/uploads', express.static('uploads')) //makes the uploads folder available to everyone
app.use(userRouter)
app.use(cartRouter)
app.use(testimonialRouter)
app.use(exclusiveRouter)
// app.use('/admin', adminRouter) //now localhost:5000/admin launches the admin panel (you can change it from here)
app.use(itemRouter) //to use the routers on this file

module.exports = app