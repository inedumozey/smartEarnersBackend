const express = require("express")
const referralReward = require('../controls/referralReward')
const { userAuth, adminAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/resolve", referralReward.resolve);

module.exports = route