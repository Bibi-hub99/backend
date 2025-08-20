//handles token generation for the user dynamically
const jsonwebtoken = require("jsonwebtoken")

const path = require("path")
const fs = require('fs')
//create a payload for the user login
//takes a document as an argument and extract id field for unique identification

//const privateKey = fs.readFileSync(path.join(__dirname,'..','private-key.pem'),"utf8")
const privateKey = process.env.PRIVATE_KEY

const createPayload = (user)=>{

    const {_id,accountType} = user

    const expireIn = 1

    const payload = {
        sub:_id,
        iat:Math.floor(Date.now() / 1000),
        accountType:accountType
    }

    const token = jsonwebtoken.sign(payload,privateKey,{expiresIn:'1d',algorithm:"RS256"})
    return {
        token:`Bearer ${token}`,
        expIn:expireIn
    }

}

module.exports = {createPayload}