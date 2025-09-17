const express = require("express")
const {createUserAccount,userLogin,forgotPassword,verifyOtp,createNewPassword, updatePassword} = require("../crud/users")
const UserRouter = express.Router()

UserRouter.post('/account/register',createUserAccount)
UserRouter.post('/account/login',userLogin)
UserRouter.post('/account/forgot-password',forgotPassword)
UserRouter.put("/account/verify-otp",verifyOtp)
UserRouter.put("/account/update-password",updatePassword)

module.exports = UserRouter