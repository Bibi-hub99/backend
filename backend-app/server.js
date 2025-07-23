require("dotenv").config({quiet:true})
const cors = require('cors')
const ConnectDB = require("./database/connect")
const express = require("express")
const passport = require("passport")


const OfferRouter = require("./routes/offer")
const LocationRouter = require("./routes/locations")
const ServiceRouter = require("./routes/services")
const UserRouter = require("./routes/users")
const ProtectedRouter = require("./routes/protected")

const app = express()
app.use(express.json())
app.use(cors())

ConnectDB()

require("./utils/passport")(passport)
app.use(passport.initialize())

app.use('/offers',OfferRouter)
app.use("/locations",LocationRouter)
app.use("/services",ServiceRouter)
app.use("/accounts",UserRouter)
app.use("/protected",ProtectedRouter)

app.use('/not-authenticated',(req,res)=>{
    console.log('not authorized')
    res.status(401).json({success:false,message:'not authenticated for access, login'})
})

app.use('not-authorized',(req,res)=>{
    res.status(402).json({success:false,message:'not authorized for action'})
})

// Create a test account or replace with real credentials.

app.use((err,req,res,next)=>{
    console.log(err.message)
    res.status(401).json({success:false,message:'not '})
})

app.listen(8888,()=>console.log('started listening on port 8888....'))