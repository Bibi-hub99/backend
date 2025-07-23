//handles protected routes interaction with the db
const passport = require("passport")
const serviceModel = require("../models/services")
const {makeBooking} = require("../crud/bookings")
const {findAccountType,getProfileInformation,updateInformation} = require("../crud/users")
const {isClient,isServiceProvider} = require("../utils/authorization")
const {addService,getProviderServices,updateService,deleteService} = require("../crud/services")
const {addComment,getComments} = require("../crud/serviceData")

const express = require("express")

const ProtectedRouter = express.Router()

const notAuth1 = '../../../not-authenticated'

ProtectedRouter.get("/booking/service/:serviceID",passport.authenticate("jwt",{session:false,failureRedirect:notAuth1}),isClient,async(req,res)=>{
    try{

        const {serviceID} = req.params
    
        const service = await serviceModel.findById(serviceID)
        res.status(200).json({success:true,service:service})

    }catch(err){
        console.log(err)
    }
})
//protected routes for account interaction
ProtectedRouter.get('/accounts/account/accountType',passport.authenticate('jwt',{session:false,failureRedirect:notAuth1}),findAccountType)
ProtectedRouter.get('/accounts/account/profile-information',passport.authenticate("jwt",{session:false,failureRedirect:notAuth1}),isServiceProvider,getProfileInformation)
ProtectedRouter.put('/accounts/account/update-information',passport.authenticate("jwt",{session:false,failureRedirect:notAuth1}),updateInformation)

ProtectedRouter.put("/booking/service/:serviceID",passport.authenticate("jwt",{session:false,failureRedirect:notAuth1}),makeBooking)

ProtectedRouter.get("/services/provider-services",passport.authenticate("jwt",{session:false,failureRedirect:"../../../not-authenticated"}),getProviderServices)
ProtectedRouter.post("/services/add-service",passport.authenticate("jwt",{session:false,failureRedirect:'../../../not-authenticated'}),addService)

ProtectedRouter.put("/services/update-service/:serviceID",passport.authenticate("jwt",{session:false,failureRedirect:"../../../not-authenticated"}),updateService)
ProtectedRouter.delete("/services/delete-service/:serviceID",passport.authenticate("jwt",{session:false,failureRedirect:"../../../not-authenticated"}),deleteService)

ProtectedRouter.put("/services/add-comment/:serviceID",passport.authenticate("jwt",{session:false,failureRedirect:"../../../not-authenticated"}),addComment)
ProtectedRouter.get("/services/get-comments/:serviceID",passport.authenticate("jwt",{session:false,failureRedirect:"../../../not-authenticated"}),getComments)


module.exports = ProtectedRouter