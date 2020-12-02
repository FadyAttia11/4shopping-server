const express = require('express')
const Exclusive = require('../models/exclusive')

const router = new express.Router()
const multer = require('multer')


const storage = multer.diskStorage({ //to specify where it will stored and what is it's name (the full path)
    destination: function(req, file, cb) {
        cb(null, './uploads/exclusive')
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

// add new exclusive
router.post('/api/exclusive/new', upload.single('exclusiveImage'), async (req, res) => {
    const exclusive = new Exclusive({
        ...req.body,
        exclusiveImage: req.file ? (req.file.path) : ("")
    })

    try {
        await exclusive.save()
        res.status(201).send(exclusive)
    }catch(e){
        res.status(500).send(e)
    }
})


//get exclusive
router.get('/api/exclusive', async (req, res) => {
    const exclusive = await Exclusive.find({})
    res.send(exclusive)
})




module.exports = router