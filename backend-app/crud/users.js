const userModel = require("../models/users")
const {createPassHash,comparePassHash} = require("../utils/password-utils")
const {createPayload} = require("../jwt-token/jwt-issuer")
const {sendMail}  = require("../utils/email")
const pinModel = require("../models/pins")
const jsonwebtoken = require("jsonwebtoken")

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
        await sendMail({
            clientEmail:savedUser.email,
            message:`
            <div>
                <h2>Your account has been created, you can log in now
            </div>
            `
        })
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
            console.log(isValid)           
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

    const {email,accountType} = req.user

    let profileInformation = {
        email,
        accountType
    }

    if(accountType === "service_provider"){

        const {firstNames,surname,telephone,gender,id_number} = req.user

        profileInformation = {

            email,
            firstNames,
            surname,
            telephone,
            gender,
            id_number,
            accountType

        }

    }

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

const forgotPassword = async (req,res,next) => {

    try{

        const {email} = req.body
        const OTP = []

        const user = await userModel.findOne({email:email})
        
        if(user){
            while(OTP.length < 5){

                const random = Math.floor(Math.random() * 10)
                OTP.push(random)

            }

            let OTP_FORMAT = ''
            
            for (let i=0; i < OTP.length;i++){
                OTP_FORMAT =  OTP_FORMAT + OTP[i]
            }

            console.log(OTP_FORMAT)

            const pinHash = await createPassHash(OTP_FORMAT,10)

            const newPin = new pinModel({
                userID:user._id,
                pin:pinHash
            })

            const newPinSaved = await newPin.save()
            await sendMail({
                clientEmail:email,
                message:`
                <div>
                    Enter this OTP to confirm your account and don't share it with anyone<br>
                    <b>${OTP_FORMAT}</b>
                </div>
                `
            })
            setTimeout(async()=>{
                console.log("gggooooooooodddddddd")
                await pinModel.findByIdAndDelete(newPinSaved._id)
            },180000)

            return res.status(200).json({success:true,otp_id:newPinSaved._id,message:"pin created"})

        }else{
            return res.redirect("/not-authenticated")
        }


    }catch(err){
        console.log(err)
    }

}

const verifyOtp = async (req,res,next) => {

    try{

        const {id,otp} = req.body
        let OTP_FORMAT = ''
        for (let i = 0; i <otp.length; i++){
            OTP_FORMAT = OTP_FORMAT + otp[i]
        }

        const findDoc = await pinModel.findById(id)


        if(findDoc){

            const isValid = await comparePassHash(OTP_FORMAT,findDoc.pin)

            if(isValid){
                return  res.status(200).json({success:true,userID:findDoc.userID,isValid:isValid})
            }else{
                return res.redirect("/not-authenticated")
            }

        }else{
            return res.redirect("/not-authenticated")
        }

    }catch(err){
        console.log(err)
    }

}

const updateCredentials = async (req, res, next) => {

    try{

        const {name,value} = req.body
        const findUser = await userModel.findById(req.user._id)

        const profileInformation = {}

        if(name !== "password"){
                
            findUser[name] = value
            findUser.markModified(name)
            profileInformation["userEmail"] = value

        }else{

            const passHash = await createPassHash(value,10)

            findUser["passHash"] = passHash
            findUser.markModified("passHash")
 
            profileInformation["userEmail"] = findUser.email

        }

        await findUser.save()
        res.status(200).json({successs:true,profileInformation:profileInformation})
    }
    catch(err){

        console.log(err)

    }

}

const updatePassword = async(req,res,next) => {


    try{


        const {password,confirm_password,userID} = req.body
        const user = await userModel.findById(userID)

        if(password === confirm_password){
            const passHash = await createPassHash(password,10)
            user["passHash"] = passHash
            user.markModified("passHash")
            await user.save()
        }else{

        }
        res.status(200).json({success:true})

    }catch(err){
        console.log(err)
    }

}

module.exports = {
    createUserAccount,
    userLogin,
    findAccountType,
    getProfileInformation,
    updateInformation,
    forgotPassword,
    updatePassword,
    verifyOtp,
    updateCredentials
}