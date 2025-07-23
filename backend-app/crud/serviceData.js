const serviceDataModel = require("../models/serviceData")

//handles logic for adding comment for a product

const addComment = async (req,res) => {

    try{

        const {comment} = req.body
        const {serviceID} = req.params
        const {_id} = req.user
        const userID = String(_id)

        await serviceDataModel.updateOne({serviceID:serviceID},{$addToSet:{comments:{
            userID,
            comment
        }}},{upsert:true})

        const comments = await serviceDataModel.findOne({serviceID:serviceID})
        res.status(200).json({success:true,comments:comments})
    }catch(err){
        console.log(err)
    }


}

const getComments = async (req,res) => {
    try{
        const {serviceID} = req.params
        const comments = await serviceDataModel.findOne({serviceID:serviceID})
        res.status(200).json({success:true,comments:comments})
    }catch(err){
        console.log(err)
    }
}

module.exports = {addComment,getComments}