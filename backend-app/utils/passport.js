//handles jwt verification and authentication of the user
const moment = require("moment")

const userModel = require("../models/users")
const jwtStrategy = require("passport-jwt").Strategy
const ExtractJwt = require("passport-jwt").ExtractJwt
const fs = require("fs")
const path = require("path")

//public key for decrypting
const publicKey = fs.readFileSync(path.join(__dirname,"..","public-key.pem"),"utf8")


//jwt options for verification
const opts = {

    secretOrKey:publicKey,
    algorithms:["RS256"],
    jwtFromRequest:ExtractJwt.fromAuthHeaderAsBearerToken()

}
//callback function for jwt verification
const verifyCallback = async(payload,done) => {

    try{
        const user = await userModel.findById(payload.sub)
        if(user){
            return done(null,user)
        }else{
            return done(null,false)
        }

    }catch(err){
        return done(err)
    }

}

const strategy = new jwtStrategy(opts,verifyCallback)

module.exports = (passport)=>{
    passport.use(strategy)
}