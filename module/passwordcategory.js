const mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/pms')
console.log("DB Conn.....")

var paswordschema = new mongoose.Schema({
    passwordcategorys:{
        type : String
    },
    date:{
        type:Date,
        default:Date.now
    }
})

var passwordmodel = mongoose.model('password_category',paswordschema)

module.exports = passwordmodel;