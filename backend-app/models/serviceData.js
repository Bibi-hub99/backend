const mongoose = require("mongoose")

const serviceDataSchema = new mongoose.Schema({
    serviceID:{type:String,required:true},
    comments:[
        {
            userID:{type:String,required:true},
            comment:{type:String,required:true}
        }
    ]
})

const serviceDataModel = mongoose.model("productData",serviceDataSchema,'productData')

module.exports = serviceDataModel