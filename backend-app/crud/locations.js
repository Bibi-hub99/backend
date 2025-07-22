//for handling requests of location information
const {locationModel} = require("../models/locations")

const getLocations = async(req,res,next) => {
    //perform db query and retrieve popular locations for users
    try{
    const locations = await locationModel.find({})
    res.status(200).json({success:true,locations:locations})
    }catch(err){
        next(new Error("Request was successful, refresh and try again"))
    }
}

module.exports = {getLocations}