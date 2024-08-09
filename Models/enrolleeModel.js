const mongoose = require('mongoose')

// first name, last name, enrollee ID, email, and profile picture upload
const enrolleSchema = new mongoose.Schema({
    first_name:{
        type:String,
        required:true,
    },
    last_name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
    },
    enrollee_id:{
        type:String,
        required:true,
    },
    profile_picture:{
        type:String,
        required:false,
    },

})

module.exports = mongoose.model('Enrollee', enrolleSchema)

