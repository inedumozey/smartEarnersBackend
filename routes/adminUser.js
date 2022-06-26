const express = require("express")
const coinbaseHandlers = require("../endpoints/coinbase");
const adminUserCtr = require('../endpoints/adminUser')
const authCtrl = require("../endpoints/auth")
const { userAuth } = require("../middlewares/auth")


const adminUserRouter = express.Router()

adminUserRouter.get("/all", adminUserCtr.getAllUsers)

adminUserRouter.get("/:id", adminUserCtr.getUser)

adminUserRouter.post("/signup", authCtrl.signup);

adminUserRouter.get("/resend-verification-link", authCtrl.resendVerificationLink);

adminUserRouter.get("/verify-account", authCtrl.verifyAccount);

adminUserRouter.post("/signin", authCtrl.signin);

adminUserRouter.post("/refreshtoken", authCtrl.refreshtoken);

adminUserRouter.post("/reset-pass-request", authCtrl.resetPassRequest);

adminUserRouter.post('/reset-pass', authCtrl.resetPass)

module.exports = adminUserRouter