require("dotenv").config({quiet:true})
const cors = require('cors')
const ConnectDB = require("./database/connect")
const express = require("express")


const OfferRouter = require("./routes/offer")
const LocationRouter = require("./routes/locations")
const ServiceRouter = require("./routes/services")


ConnectDB()

const app = express()

app.use(cors())

app.use('/offers',OfferRouter)
app.use("/locations",LocationRouter)
app.use("/services",ServiceRouter)

app.listen(8888,()=>console.log('started listening on port 8888....'))