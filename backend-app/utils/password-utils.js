const bcrypt = require("bcrypt")

const createPassHash = async(password,saltRound) =>{
    const passSalt = await bcrypt.genSalt(saltRound)
    const passHash = bcrypt.hash(password,passSalt)
    return passHash
}

const comparePassHash = async(password,hash)=>{
    const isValid = await bcrypt.compare(password,hash)
    return isValid
}

module.exports = {createPassHash,comparePassHash}