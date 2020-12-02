const express = require('express')
const Item = require('../models/item')
const auth = require('../middleware/auth')
const router = new express.Router()
const multer = require('multer')

const storage = multer.diskStorage({ //to specify where it will stored and what is it's name (the full path)
    destination: function(req, file, cb) {
        cb(null, './uploads/products')
    },
    filename: function(req, file, cb) {
        cb(null, Date.now() + file.originalname)
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
        cb(null, true) //means accept the file
    } else {
        cb(null, false) //means don't accept the file but don't throw an error
    }
}

// const upload = multer({ dest: 'uploads/' }) //used to upload files (imgs)
const upload = multer({ 
    storage: storage, 
    limits: {
        fileSize: 1024 * 1024 * 5 //a number in bytes (this is 1mb)
    },
    fileFilter: fileFilter
}) 


router.post('/api/items', upload.array('productImages', 50),async (req, res) => {
    let numberOfPhotos = req.files.length;
    console.log(numberOfPhotos)
    const details = req.body.details.split("/")
    if(req.body.colors) if(!Array.isArray(req.body.colors)) req.body.colors = req.body.colors.split(" ")
    if(req.body.sizes) if(!Array.isArray(req.body.sizes)) req.body.sizes = req.body.sizes.split(" ")
    if(req.body.keywords) if(!Array.isArray(req.body.keywords)) req.body.keywords = req.body.keywords.split(" ")
    const item = new Item({ 
        ...req.body,
        details,
        productImages: (req.files.length !== 0) ? (req.files.map((file) => file.path)) : ([])
        // productImages: (req.files.length !== 0) ? ([req.files[0].path, req.files[1].path, req.files[2].path, req.files[3].path]) : ([])
    })
    try {
        await item.save()
        res.status(201).send(item)
    }catch(e){
        res.status(400).send(e)
    }
})

//Update Existing Product
router.patch('/api/items/edit/:name', async (req, res) => {
    if(req.body.colors) if(!Array.isArray(req.body.colors)) req.body.colors = req.body.colors.split(" ")
    if(req.body.sizes) if(!Array.isArray(req.body.sizes)) req.body.sizes = req.body.sizes.split(" ")
    if(req.body.keywords) if(!Array.isArray(req.body.keywords)) req.body.keywords = req.body.keywords.split(" ")

    console.log(req.body)

    const updates = Object.keys(req.body) //take all keys and put them into an array
    const allowedUpdates = ['productImages', 'category', 'price', 'salePrice', 'colors', 'sizes', 'keywords']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) return res.status(400).send({ error: 'invalid updates!' })

    const name = req.params.name
    
    try {
        const item = await Item.findOne({ name })
        if(!item) return res.status(404).send()

        updates.forEach((update) => item[update] = req.body[update])
        await item.save() 

        res.send(item)
    }catch(e){
        res.status(400).send(e)
    }
})

//get the number of all items 
router.get('/api/items/all/count', async (req, res) => {
    try {
        //count all items (to know how many pages in front for arrow rendering)
        let count = await Item.countDocuments({})
        const stringCount = count.toString() //res.send() doesn't allow integer to be send back !
        res.send(stringCount)
    } catch (e) {
        return res.status(500).json(e)
    }
})


//get all items without pagination
router.get('/api/items', async (req, res) => {
    try {
        const items = await Item.find({})
        res.send(items)
    } catch (e) {
        return res.status(500).json(e)
    }
})


//get all items (NEW) (pagination ==> 20 per page)
router.get('/api/items/all', async (req, res) => {
    try {
        const page = (req.query.page)
        const category = req.query.category
        // console.log(page)
        // console.log(category)
        const items = await Item.getItemsPerPage(page, category) //go to method to get 20 per page
        res.send(items)
    } catch (e) {
        return res.status(500).json(e)
    }
})

//get all items that have discount (the offers) => (with pagination - NOT TESTED)
router.get('/api/items/offers', async (req, res) => {
    const page = (req.query.page)
    // const items = await Item.find({})
    // offerItems = items.filter((item) => item.price !== item.salePrice)
    const items = await Item.getOffersPerPage(page) //go to method to get 20 per page
    res.send(items)
})


//get offers item total count
router.get('/api/items/offers/count', async (req, res) => {
    const items = await Item.find({})
    const filteredItems = items.filter(item => item.price !== item.salePrice)
    const count = filteredItems.length
    const stringCount = count.toString() //res.send() doesn't allow integer to be send back !
    res.send(stringCount)
})


//GET /items?completed=true
//GET /items?limit=10&skip=20
//GET /items?sortBy=createdAt:desc
router.get('/api/items', async (req, res) => {
    const match = {}
    const sort = {}
    const page = (req.query.page)
    const PAGE_SIZE = 20
    const skip = (page - 1) * PAGE_SIZE
    // //make the query boolean instead of string then make the match completed like it
    // if(req.query.completed) match.completed = req.query.completed === 'true'

    // if(req.query.sortBy) {
    //     const parts = req.query.sortBy.split(':')
    //     sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    // }

    try {
        // const items = await Item.find({ ownerID: req.user._id }) //first approach
        await req.user.populate({
            path: 'items',
            match, //used for filtering (like showing only the false or true items)
            options: { //used for paginating (limiting data for single page)
                limit: PAGE_SIZE, //for limit the data for single page
                skip, //for showing the 2nd or 3rd pages
                sort
            }
        }).execPopulate() //second approach
        res.send(req.user.items)
        // res.send(items)
    }catch(e){
        res.status(500).send()
    }
})





router.post('/api/items/find', async (req, res) => {
    const items = await Item.find({
        keywords: req.body.searchValue
    })
    res.send(items)
})

//get all items for a specific user by his id (NEW)
router.get('/api/items/all/:id', async (req, res) => {
    const _id = req.params.id //user id (NOT item id)
    const items = await Item.find({ ownerID: _id })
    res.send(items)
})



//get item by it's id
router.get('/api/items/:id', async (req, res) => {
    const _id = req.params.id
    try {
        const item = await Item.findOne({ _id })
        if(!item) return res.status(404).send()
        res.send(item)
    }catch(e){
        res.status(500).send()
    }
})




router.delete('/items/:id', auth, async (req, res) => {
    const _id = req.params.id

    try {
        const item = await Item.findOneAndDelete({ _id, ownerID: req.user._id })
        if(!item) return res.status(404).send()

        res.send(item)
    }catch(e){
        res.status(500).send()
    }
})


//delete all items for all users (for development only) (NEW)
router.delete('/api/items/all', async (req, res) => {
    await Item.deleteMany({})
    res.send()
})


module.exports = router