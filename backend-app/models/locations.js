const mongoose = require("mongoose")

//collection for tracking popular destinations of tourists

const locationSchema = new mongoose.Schema({
    location:String,
    imageURL:String,
    country:String
})

const locationModel = mongoose.model("locations",locationSchema,"locations")


module.exports = {locationModel}