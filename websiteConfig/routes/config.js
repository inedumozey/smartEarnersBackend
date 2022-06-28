const express = require("express")
const config = require('../controls/config')
const { userAuth, adminAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.post("/set", config.setConfig);
route.get("/get", config.getConfig);
route.put("/update", adminAuth, config.updateConfig);
route.put("/update-contact", adminAuth, config.updateContact);
route.put("/update-benefits", adminAuth, config.updateBenefits);
route.put("/update-logo", adminAuth, config.updateLogo);
route.delete("/remove-logo", adminAuth, config.removeLogo);

module.exports = route