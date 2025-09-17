const FavoriteModel = require("../models/favorites")
const ServiceModel = require("../models/services")

const getFavorites = async (req,res,next) => {

    try{

        const userID = String(req.user._id)

        const favorites = await FavoriteModel.find({
            userID:userID
        })

        let favsIDs = []

        favorites.forEach((each) => {
            favsIDs = [...favsIDs.concat([...each.favorites])]
        })

        const myFavorites = await ServiceModel.find({
            _id:{
                $in:favsIDs
            }
        })

        res.status(200).json({success:true,myFavorites:myFavorites})

    }catch(err){
        console.log(err)
    }

}

const addFavorite = async (req,res,next) => {

    try{

        const {serviceID} = req.params
        const userID = String(req.user._id)

        if(serviceID !== "undefined" && serviceID !== undefined){

            await FavoriteModel.updateOne({userID},{$addToSet:{favorites:serviceID}},{upsert:true})

            const favorites = await FavoriteModel.findOne({userID:userID},{favorites:1,userID:1})


            const myFavorites = await ServiceModel.find({

                _id:{
                    $in:favorites.favorites
                }

            })

            res.status(200).json({success:true,message:"serviced added to favorites"})

        }

    }catch(err){
        console.log(err)
    }

}

const deleteFavorite = async (req,res,next) => {

    try{

        const {serviceID} = req.params
        const userID = String(req.user._id)

        await FavoriteModel.updateOne({userID},{$pull:{favorites:serviceID}})

        const favorites = await FavoriteModel.findOne({
            userID:userID
        })

        let favsIDs = []

        favorites.favorites.forEach((each) => {
            favsIDs.push(each)
        })


        const myFavorites = await ServiceModel.find({
            _id:{
                $in:favsIDs
            }
        })

        res.status(200).json({success:true,myFavorites:myFavorites})

    }catch(err){
        console.log(err)
    }

}

module.exports = {addFavorite,getFavorites,deleteFavorite}