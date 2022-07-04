const express = require("express")
const referralReward = require('../controls/referralReward')
const { verifiedUserAuth, adminAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/resolve", referralReward.resolve);
route.get("/get-all-rewards", verifiedUserAuth, referralReward.getAllRewards);
route.get("/get-reward", verifiedUserAuth, referralReward.getRewards);

module.exports = route