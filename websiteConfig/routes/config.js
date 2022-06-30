const express = require("express")
const config = require('../controls/config')
const { adminAuth } = require("../../auth/middlewares/auth")

const route = express.Router()

route.get("/get", config.getConfig);
route.put("/update", adminAuth, config.updateConfig);
route.put("/update-logo", adminAuth, config.updateLogo);
route.delete("/remove-logo", adminAuth, config.removeLogo);

module.exports = route