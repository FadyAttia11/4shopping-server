const express = require('express')
const Cart = require('../models/cart')
const auth = require('../middleware/auth')
const Item = require('../models/item')

const router = new express.Router()


//add product to cart
router.post('/api/cart/addtocart', auth, async (req, res) => {

    // const item = await Item.find({ _id })
    // if(!item) return res.status(404).send()
    const cart = new Cart({...req.body})

    try {
        await cart.save()
        res.status(201).send(cart)
    }catch(e){
        res.status(400).send(e)
    }
})


//get all products for specific user by his id (get user cart)
router.get('/api/cart/getusercart/:id', auth, async (req, res) => {
    const userOwnerId = req.params.id //the user id to get his cart
    const cart = await Cart.find({ userOwnerId })
    res.send(cart)
})


//edit the cart (given the product id)
router.patch('/api/cart/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body) //take all keys and put them into an array
    const allowedUpdates = ['quantity', 'unitPrice', 'totalPrice']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) return res.status(400).send({ error: 'invalid updates!' })

    const _id = req.params.id

    try {
        const cart = await Cart.findById(_id)
        if(!cart) return res.status(404).send()

        updates.forEach((update) => cart[update] = req.body[update])
        await cart.save() //use these 3 lines not the commented one for using middleware for pre-save command
        // const item = await Item.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })
        
        res.send(cart)
    }catch(e){
        res.status(400).send(e)
    }
})


//delete one cart (element from a specific cart)
router.delete('/api/cart/:id', auth, async (req, res) => { //the id of the cart (_id)
    const _id = req.params.id
    try {
        const cart = await Cart.findByIdAndDelete(_id)
        if(!cart) return res.status(404).send()

        // const deletedCart = await Cart.deleteOne({ _id: cart._id, color: cart.color, size: cart.size })
        res.send(cart)
    }catch(e){
        res.status(500).send(e)
    }
})




module.exports = router