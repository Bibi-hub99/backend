const mongoose = require("mongoose")
const {addressSchema} = require("../schemas/schemas")
//model for weekly and newly announced or made short term offers

const offerSchema = new mongoose.Schema({
    title:{type:String,required:true,minLength:5,unique:true},
    description:{type:String,required:true},
    category:{type:String,required:true},
    imageURL:{type:String,unique:true},
    price:{type:Number,required:true,min:1},
    location:{type:String,required:true},
    address:addressSchema//implements the address schema created for reusability

})

offerSchema.statics.findOffers = async function findProducts(){
    const offers = await this.find({})
    return offers
}//static method for finding all offers

const offerModel = mongoose.model("offers",offerSchema,"offers")

module.exports = offerModel