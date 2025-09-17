const mongoose = require("mongoose")

const pinSchema = new mongoose.Schema({
    userID:{type:String,required:true,unique:true},
    pin:{type:String,required:true,unique:true}
})

const pinModel = mongoose.model("pins",pinSchema,"pins")

module.exports = pinModel