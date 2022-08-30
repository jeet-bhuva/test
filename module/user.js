const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/pms')
console.log("DB Conn.....")

var userschema = new mongoose.Schema({
    uname:{
        type : String
    },
    email:{
        type : String
    },
    password:{
        type : String
    },
    date:{
        type:Date,
        default:Date.now
    }
})

var usermodel = mongoose.model('users',userschema)

module.exports = usermodel;
