const mongoose = require('mongoose')
const config = require('../config/key')

//http methods for CRUD ==> Create(POST) - Read(GET) - Update(PATCH) - Delete(DELETE) 

//connecting to mongodb function
mongoose.connect(config.mongoURI,
    {
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true
        //useFindAndModify: false
    }).then(() => console.log('DB connected'))
    .catch(err => console.log(err))


