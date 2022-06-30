const express = require("express")
const deposit = require('../controls/deposit')
const { adminAuth, verifiedUserAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.post("/pay-user", verifiedUserAuth, deposit.pend);


module.exports = route