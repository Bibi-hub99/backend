const userModel = require("../models/users")
const {createPassHash,comparePassHash} = require("../utils/password-utils")
const {createPayload} = require("../jwt-token/jwt-issuer")



const createUserAccount = async(req,res,next) => {

    try{

        const {accountType,email,password} = req.body
        const passHash = await createPassHash(password,10)
        const userAccount = {
            accountType,
            email,
            passHash
        }
        
        if(accountType === "service_provider"){
            const {firstNames,surname,telephone,gender,id_number} = req.body
            userAccount.firstNames = firstNames
            userAccount.surname = surname
            userAccount.telephone = telephone
            userAccount.gender = gender
            userAccount.id_number = id_number
        }

        
        const newUser = new userModel(userAccount)
        const savedUser = await newUser.save()
        res.status(200).json({success:true})

    }catch(err){
        next(err)
    }

}

//handles user login logic and jwt assignment
const userLogin = async(req,res,next) => {

    try{

        const {email,password} = req.body
        const userAccount = await userModel.findOne({email:email})

        
        if(!userAccount){
            //call error if no account matches
            next(new Error("account not found, wrong credentials!"))
        }else{
            //handling hash comparing logic
            const isValid = await comparePassHash(password,userAccount.passHash)            
            if(isValid){
                const payload = createPayload(userAccount)
                return res.status(200).json({success:true,payload:payload,accountType:userAccount.accountType})
            }else{
                next(new Error("incorrect login in credentials!"))
            }
        }
        
    }catch(err){
        next(err)
    }

}

const findAccountType = async(req,res,next) => {
    try{
        res.status(200).json({success:true,accountType:req.user.accountType})
    }catch(err){
        next(err)
    }
}

const getProfileInformation = async (req,res,next) => {
    const profileInformation = req.user
    delete profileInformation._id
    delete profileInformation.passHash
    res.status(200).json({success:true,profileInformation:profileInformation})
}

const updateInformation = async (req,res,next) => {

    try{

        const {firstNames,surname,telephone,id_number,gender} = req.body
        const updateObj = {
            firstNames,
            surname,
            telephone,
            id_number,
            gender
        }

        const userID = String(req.user._id)
        await userModel.updateOne({_id:userID},{$set:updateObj})
        
        const profileInformation = await userModel.findOne({_id:userID},{passHash:0,_id:0})
        res.status(200).json({success:true,profileInformation:profileInformation})
    }catch(err){
        console.log(err)
    }
    
}

module.exports = {
    createUserAccount,
    userLogin,
    findAccountType,
    getProfileInformation,
    updateInformation
}