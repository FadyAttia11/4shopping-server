const express = require('express')
const Testimonial = require('../models/testimonial')

const router = new express.Router()
const multer = require('multer')


const storage = multer.diskStorage({ //to specify where it will stored and what is it's name (the full path)
    destination: function(req, file, cb) {
        cb(null, './uploads/testimonial')
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
        fileSize: 1024 * 1024 //a number in bytes (this is 1mb)
    },
    fileFilter: fileFilter
}) 

// add new testimonial
router.post('/api/testimonial/new', upload.single('testimonialImage'), async (req, res) => {
    const testimonial = new Testimonial({
        ...req.body,
        testimonialImage: req.file ? (req.file.path) : ("")
    })

    try {
        await testimonial.save()
        res.status(201).send(testimonial)
    }catch(e){
        res.status(500).send(e)
    }
})


//get testimonials
router.get('/api/testimonials/all', async (req, res) => {
    const testimonials = await Testimonial.find({})
    res.send(testimonials)
})




module.exports = router