const express = require("express")
const {createUserAccount,userLogin} = require("../crud/users")
const UserRouter = express.Router()

UserRouter.post('/account/register',createUserAccount)
UserRouter.post('/account/login',userLogin)

module.exports = UserRouter