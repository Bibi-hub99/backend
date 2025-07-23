const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    firstNames:{type:String,default:'not provided'},
    surname:{type:String,default:'not provided'},
    telephone:{type:String,default:'not provided'},
    gender:{type:String,default:'not provided'},
    id_number:{type:String,default:'not provided'},
    accountType:{type:String,default:'client',required:true},
    email:{type:String,required:true,minLength:10,unique:true},
    passHash:{type:String,required:true,minLength:10}
})

const userModel = mongoose.model("users",userSchema,"users")

module.exports = userModel