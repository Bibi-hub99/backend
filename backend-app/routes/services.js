const express = require("express")

const {findServices,findByCategory,searchServices,findSingleService,queryServices,searchTravelTickets} = require("../crud/services")


/*
handles routes which begins with services by assigning middlewares to matching routes
 */

const ServiceRouter = express.Router()

ServiceRouter.get("/",findServices)
ServiceRouter.get("/categories",findByCategory)
ServiceRouter.get('/search',searchServices)
ServiceRouter.get("/service/:serviceID",findSingleService)
ServiceRouter.get("/search-all",queryServices)
ServiceRouter.get('/search-travel-tickets',searchTravelTickets)

module.exports = ServiceRouter