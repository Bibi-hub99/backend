const express = require("express")
const {getLocations} = require("../crud/locations")

//router for handling routes directed from main app to this beginning with locations

const LocationRouter = express.Router()

LocationRouter.get("/",getLocations)

module.exports = LocationRouter