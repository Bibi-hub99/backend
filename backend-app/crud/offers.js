const offerModel = require("../models/offers")

const findOffers = async(req,res,next) => {
    try{
        const offers = await offerModel.findOffers()
        res.status(200).json({success:true,offers:offers})
    }catch(err){
        console.log(err)
        next(new Error("An error occured, refresh the page and try again"))
    }
}

module.exports = {findOffers}