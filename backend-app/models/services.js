const mongoose = require('mongoose')

//model for perfoming read and writes on database on services collections



const serviceSchema = new mongoose.Schema({
    title:{type:String,required:true,unique:true},
    imageURL:{type:String,required:true,unique:true},
    description:{type:String,required:true},
    category:{type:String,required:true},
    price:{type:Number,required:true},
    location:{
        country:String,
        city:String
    },
    uniqueFeatures:{

    }
})

serviceSchema.statics.findByCategory = async function findByCategory(queryObj){
    const services = await this.find(queryObj)
    return services
}

const serviceModel = mongoose.model("services",serviceSchema,"services")

module.exports = serviceModel