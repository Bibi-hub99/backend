const { query } = require("@splidejs/splide/src/js/utils")
const serviceModel = require("../models/services")

//middlewares for services request and database queries


const findServices = async(req,res,next) => {
    try{
        const services = await serviceModel.find({}).skip(req.query.skip).limit(req.query.limit)
        res.status(200).json({success:true,services:services})
    }catch(err){
        next(err)   
    }
}

const findByCategory = async(req,res,next) => {
    try{

        const queryObj = {}
        const {category,skip,limit,searchTerm} = req.query
        if(searchTerm !== "" && searchTerm !== undefined && searchTerm !== "undefined"){
            queryObj.$text = {$search:`\"${searchTerm}\"`}
        }
        queryObj.category = category
        const services = await serviceModel.findByCategory(queryObj,skip,limit)
        res.status(200).json({success:true,services:services})

    }catch(err){
        next(err)
    }
}

const searchServices = async(req,res,next) => {

    try{

        const queryObj = {}

        const {searchTerm} = req.query

        queryObj.$text = {$search:`\"${searchTerm}\"`}

        if(req.query.category){
            if(req.query.category !=="undefined" && req.query.category !== undefined){
                queryObj.category = {$eq:req.query.category}
            }
        }

        const services = await serviceModel.searchServices(queryObj)

        res.status(200).json({success:true,services:services})

    }catch(err){
        next(err)
    }
    
}

const findSingleService = async(req,res,next)=>{

    try{

        const {serviceID} = req.params
        const service = await serviceModel.findSingleService(serviceID)
        const similar = await service.findSimilar()
        res.status(200).json({success:true,service:service,similarServices:similar})

    }catch(err){
        console.log(err)
        next(err)
    }

}

const queryServices = async(req,res,next) => {

    try{

        const queryObj = {}
        queryObj.$text = {$search: `\"${req.query.searchTerm}\"`}
        const filterArr = []

        const categoryProv = req.query.category !== "undefined" && req.query.category !== undefined && req.query.category !== null && req.query.category !== "null"
        
        if(categoryProv){
            queryObj.category = {$eq:req.query.category}
        }

        const queryDB = serviceModel.find(queryObj)

        if(req.query.minFilter === "true"){
            filterArr.push({price:{$gte:0,$lte:1000}})
        }

        if(req.query.midFilter === "true"){
            filterArr.push({price:{$gte:1001,$lte:2000}})
        }

        if(req.query.highFilter === "true"){
            filterArr.push({price:{$gte:2001,$lte:3000}})
        }

        const refactor = {
            $or:filterArr
        }

        let queryFinal = queryDB.find(refactor)

        if(req.query.sort !== undefined && req.query.sort !== "undefined" && req.query.sort !== null && req.query.sort !== "null"){
            const sort = req.query.sort
            if(sort === "by_name"){
                queryFinal = queryFinal.find({}).sort({title:1})
            }else if (sort === 'by_price_asc'){
                queryFinal = queryFinal.find({}).sort({price:1})
            }else if (sort === 'by_price_des'){
                queryFinal = queryFinal.find({}).sort({price:-1})
            }
        }

        const services = await queryFinal.find({})
        
        res.status(200).json({success:true,services:services})

    }catch(err){
        console.log(err)
        next(err)
    }
    
}

const addService = async (req,res,next) => {
    try{
        const {_id} = req.user
        const {title,price,imageURL,category,description} = req.body
        const providerID = String(_id)
        let serviceObj = {
    
            title,
            description,
            price,
            imageURL,
            category,
            providerID
        }

        if(category === "stays" || category === "activities"){
            const {location} = req.body
            const locationSplits = location.split(",")
            serviceObj['location'] = {
                country:locationSplits[0],
                city:locationSplits[1],
                streetName:locationSplits[2],
                postCode:locationSplits[3]
            }
        }else if(category === "flights" || category === "buses"){
            const {departAddress,departTime,arrivalAddress,arrivalTime} = req.body
            const departSplits = departAddress.split(",")
            const arrivalSplits = arrivalAddress.split(",")

            let dTime = new Date(departTime)
            let aTime = new Date(arrivalTime)
            const departHours = dTime.getHours() + ':' + dTime.getMinutes()
            const arrivalHours = aTime.getHours() + ':' + aTime.getMinutes()
            //service
            serviceObj = {
                ...serviceObj,
                location:{
                    country:departSplits[0],
                    city:departSplits[1]
                },
                uniqueFeatures:{
                    tripFromAddress:{
                        streetName:departSplits[2].toUpperCase(),
                        postCode:departSplits[3],
                        time:departHours
                    },
                    tripToAddress:{
                        country:arrivalSplits[0].toUpperCase(),
                        city:arrivalSplits[1].toUpperCase(),
                        streetName:arrivalSplits[2].toUpperCase(),
                        postCode:arrivalSplits[3],
                        time:arrivalHours
                    }
                }
            }
        }
        
        const newService = new serviceModel(serviceObj)
        await newService.save()

        const services = await serviceModel.find({providerID:providerID},{providerID:0})

        res.status(200).json({success:true,services:services})

    }catch(err){
        console.log(err)
        next(err)
    }
}

const getProviderServices = async (req,res,next) => {
    try{
        const {_id} = req.user
        const providerID = String(_id)
        const services = await serviceModel.find({providerID:providerID},{providerID:0})
        res.status(200).json({success:true,services:services})
    }catch(err){
        console.log(err)
    }
}

const updateService = async (req,res,next) => {
    try{

        const {title,price,imageURL,category,description} = req.body
        const {serviceID} = req.params
        const {_id} = req.user
        const providerID = String(_id)
        let updateObj = {title,price,imageURL,description}
        
        if(category === "stays" || category === "activities"){
            const {location} = req.body
            const locationSplits = location.split(",")
            updateObj['location'] = {
                country:locationSplits[0],
                city:locationSplits[1]
            }
            
        }else if(category === "flights" || category === "buses"){
            const {departAddress,departTime,arrivalAddress,arrivalTime} = req.body
            const departSplits = departAddress.split(",")
            const arrivalSplits = arrivalAddress.split(",")

            let dTime = new Date(departTime)
            let aTime = new Date(arrivalTime)
            const departHours = dTime.getHours() + ':' + dTime.getMinutes()
            const arrivalHours = aTime.getHours() + ':' + aTime.getMinutes()
            //service
            updateObj = {
                ...updateObj,
                location:{
                    country:departSplits[0],
                    city:departSplits[1]
                },
                uniqueFeatures:{
                    tripFromAddress:{
                        streetName:departSplits[2].toUpperCase(),
                        postCode:departSplits[3].toUpperCase(),
                        time:departHours
                    },
                    tripToAddress:{
                        country:arrivalSplits[0].toUpperCase(),
                        city:arrivalSplits[1].toUpperCase(),
                        streetName:arrivalSplits[2].toUpperCase(),
                        postCode:arrivalSplits[3],
                        time:arrivalHours
                    }
                }
            }
        }
        await serviceModel.findByIdAndUpdate(serviceID,{$set:updateObj})
        const services = await serviceModel.find({providerID:providerID})
        res.status(200).json({success:true,services:services},{providerID:0})

    }catch(err){
        console.log(err)
    }
}

const deleteService = async (req,res,next) => {
    try{
        const {serviceID} = req.params
        const {_id} = req.user
        const providerID = String(_id)
        await serviceModel.findByIdAndDelete(serviceID)
        const services = await serviceModel.find({providerID:providerID},{providerID:0})
        res.status(200).json({success:true,services:services})
    }catch(err){
        console.log(err)
    }

}

const searchTravelTickets = async (req,res,next) => {

    try{
        let {depart,arrival,category,time} = req.query
        depart = `${depart.toUpperCase()}`
        arrival = `${arrival.toUpperCase()}`

        console.log(category)

        const queryObj = {
            'location.city':depart,
            'uniqueFeatures.tripToAddress.city':arrival,
            category:category
        }

        console.log(queryObj)
        
        const services = await serviceModel.find(queryObj)
        res.status(200).json({success:true,services:services})
    }catch(err){
        console.log(err)
    }
    
}



module.exports = {
    findServices,
    findByCategory,
    searchServices,
    findSingleService,
    queryServices,
    addService,
    updateService,
    getProviderServices,
    deleteService,
    searchTravelTickets
}
