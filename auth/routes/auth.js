const express = require("express")
const authCrtl = require('../controls/auth')
const { userAuth, adminAuth } = require("../middlewares/auth")

const route = express.Router()

route.get("/get-all-users", adminAuth, authCrtl.getUsers);

route.get("/get-user/:id", userAuth, authCrtl.getUser);

route.post("/signup", authCrtl.signup);

route.get("/resend-verification-link", userAuth, authCrtl.resendVerificationLink);

route.get("/verify-account", userAuth, authCrtl.verifyAccount);

route.post("/signin", authCrtl.signin);

route.get("/logout", authCrtl.logout);

route.get("/generate-accesstoken", authCrtl.generateAccesstoken);

route.post("/reset-pass-request", authCrtl.resetPassRequest);

route.post('/reset-pass', authCrtl.resetPass);



route.get('/remove-unverified-users', authCrtl.removeUnverifiedUsers)

route.get('/block-user/:id', adminAuth, authCrtl.blockUser)

route.get('/unblock-user/:id', adminAuth, authCrtl.unblockUser)

//only the admin and logged in user will have access to this
route.get('/delete-user/:id', userAuth, authCrtl.deleteAccount)

// delete all users except the admin
//only the admin will have access to this
route.get('/delete-all-users', adminAuth, authCrtl.deleteAllUsers)

module.exports = route