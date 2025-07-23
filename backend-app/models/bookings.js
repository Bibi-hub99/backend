const mongoose = require("mongoose")

const bookingSchema = new mongoose.Schema({

    //userID:{type:String,required:true},
    serviceID:{type:String,required:true},
    createdAt:{type:Date,required:true,default:Date.now()},
    bookings_information:[
        {
            userID:{type:String,required:true},
            uniqueFeatures:{
                
            }
        }
    ]
})

const bookingModel = mongoose.model("bookings",bookingSchema,"bookings")
module.exports = bookingModel