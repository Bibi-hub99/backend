//middlewares for authorizing routes and only allow specific read and writes

const isClient = (req,res,next) => {
    const {accountType} = req.user
    if(accountType === 'client'){
        next()
    }else{
        res.status(403).json({success:false,message:'not authorized for action'})
    }
}

const isServiceProvider = (req,res,next) => {
    const {accountType} = req.user
    if(accountType === 'service_provider'){
        next()
    }else{
        res.status(403).json({success:false,message:'not authorized for action'})
    }
}

module.exports = {isClient,isServiceProvider}