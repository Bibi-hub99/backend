const mongoose = require("mongoose")

//stores reausable schemas for the database

const addressSchema = new mongoose.Schema({
    town:{type:String,required:true},
    postCode:{type:String,required:true,minLength:4,maxLength:4},
    streetName:{type:String,required:true},
    houseNumber:{type:Number,required:true}
})


module.exports = {addressSchema}