const express = require("express")

const {findServices,findByCategory} = require("../crud/services")


/*
handles routes which begins with services by assigning middlewares to matching routes
 */

const ServiceRouter = express.Router()

ServiceRouter.get("/",findServices)
ServiceRouter.get("/categories",findByCategory)

module.exports = ServiceRouter