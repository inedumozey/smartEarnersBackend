const express = require("express")
const referralBonus = require('../controls/referralBonus')
const { verifiedUserAuth, adminAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/get-all-bonuses", verifiedUserAuth, referralBonus.getAllBounuses);
route.get("/get-bonus/:id", verifiedUserAuth, referralBonus.getBounus);

module.exports = route