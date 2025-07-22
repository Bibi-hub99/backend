require("dotenv").config({quiet:true})

const ConnectDB = require("./database/connect")
const express = require("express")
const OfferRouter = require("./routes/offer")
const LocationRouter = require("./routes/locations")
const cors = require('cors')


ConnectDB()

const app = express()

app.use(cors())

app.use('/offers',OfferRouter)
app.use("/locations",LocationRouter)

app.listen(8888,()=>console.log('started listening on port 8888....'))