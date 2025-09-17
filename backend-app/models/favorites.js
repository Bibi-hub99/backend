//for favorites scheming and modelling
const mongoose = require("mongoose")

const favoriteSchema = new mongoose.Schema({
    userID:{type:String,required:true},
    favorites:[]  
})

const FavoriteModel = mongoose.model("favorites",favoriteSchema)

module.exports = FavoriteModel