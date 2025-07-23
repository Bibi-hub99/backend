const mongoose = require('mongoose')
//model for perfoming read and writes on database on services collections



const serviceSchema = new mongoose.Schema({
    title:{type:String,required:true,unique:true,get:(u)=>u.toUpperCase(),set:(u)=>u.toUpperCase()},
    providerID:{type:String,required:true},
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

serviceSchema.statics.findByCategory = async function findByCategory(queryObj,skip,limit){
    
    const services = await this.find(queryObj).skip(skip).limit(limit)
    return services
}

serviceSchema.statics.searchServices = async function searchServices(queryObj){
    const services = await this.find(queryObj)
    return services
}

serviceSchema.statics.findSingleService = async function findSingleService(id){
    const service = await this.findById(id)
    return service
}

serviceSchema.methods.findSimilar = async function findSimilar(){
    //const services = await mongoose.model("services").find({$and:[{category:this.category},{_id:{$ne:this._id}}]})
    const services = await mongoose.model("services").find({$and:[{category:this.category},{_id:{$ne:this._id}}]})
    return services
}

serviceSchema.get()

const serviceModel = mongoose.model("services",serviceSchema,"services")

module.exports = serviceModel