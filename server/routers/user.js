const express = require('express')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
// const { sendWelcomeEmail, sendCancelationEmail } = require('../emails/account')
const router = new express.Router()
const multer = require('multer')


const storage = multer.diskStorage({ //to specify where it will stored and what is it's name (the full path)
    destination: function(req, file, cb) {
        cb(null, './uploads/avatars')
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


router.post('/api/users', upload.single('profileImage'),async (req, res) => {
    console.log(req.file)
    const user = new User({
        ...req.body,
        profileImage: req.file ? (req.file.path) : ("")
    })
    try {
        // await user.save()
        // sendWelcomeEmail(user.email, user.name)
        const token = await user.createAuthToken()
        await user.save()
        res.status(201).send({ user, token })
    }catch(e) {
        res.status(400).send(e)
    }
})


router.post('/api/users/me/avatar', auth, upload.single('profileImage'), async (req, res) => {
    console.log(req.file)
    // const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.profileImage = req.file.path //req.file ==> the image is accessible here
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})



// router.post('/multiple-upload',auth, upload.array('profileImage', 2),async (req, res) => {
//     try {
//         req.user.profileImage = req.file.path
//         await req.user.save()
//         res.send(req.user)
//     } catch (e) {
//         res.status(400).send(e)
//     }
// })

router.post('/api/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.createAuthToken()
        await user.save()
        res.cookie("x_auth", token)
        .status(200)
        .json({
            loginSuccess: true,
            user, 
            token
        })
    }catch(e){
        res.status(400).send()
    }
})

router.get('/api/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })
        await req.user.save()
        res.send({ logoutSuccess: true })
    } catch (e) {
        res.status(500).send()
    }
})

router.post('/users/logoutAll', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.send()

    } catch (e) {
        res.status(500).send()
    }
})

//get all users (NEW)
router.get('/api/users/all', async (req, res) => {
    const users = await User.find({})
    res.send(users)
})

//read my profile
router.get('/api/users/me', auth, async (req, res) => {
    res.send(req.user)
})


router.patch('/users/me', auth, async (req, res) => {
    const updates = Object.keys(req.body) //take all keys and put them into an array
    const allowedUpdates = ['name', 'email', 'password', 'age']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation) return res.status(400).send({ error: 'invalid updates!' })

    try {
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save() //use these 3 lines not the commented one for using middleware for pre-save command
        // const user = await User.findByIdAndUpdate(_id, req.body, { new: true, runValidators: true })

        res.send(req.user)
    }catch(e){
        res.status(400).send(e)
    }
})

router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if(!user) return res.status(404).send()
        await req.user.remove()
        // sendCancelationEmail(req.user.email, req.user.name)
        res.send(req.user)
    }catch(e){
        res.status(500).send()
    }
})

// const upload = multer({
//     storage,
//     limits: {
//         fileSize: 1024 * 1024
//     },
//     fileFilter(req, file, cb){
//         if(!file.originalname.match(/\.(jpg|jpeg|png)/)){
//             cb(new Error('please upload an image!'))
//         }
//         cb(undefined, true)
//     }
// })


router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})


router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
        if(!user || !user.avatar){
            throw new Error()
        }

        res.set('Content-Type', 'image/png') //set the expected coming type to jpg
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})


module.exports = router