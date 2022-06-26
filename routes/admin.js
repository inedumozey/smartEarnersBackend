const express = require("express")
const coinbaseHandlers = require("../endpoints/coinbase");
const adminCtr = require('../endpoints/admin')
const authCtrl = require("../endpoints/auth")
// const { removeUnVerifiedUsers } = require("../utils/filterUsers")
const { adminAuth } = require("../middlewares/auth")

const adminRouter = express.Router()


/** Admin End Points */
adminRouter.post("/user/deactivate", authCtrl.deactivateUser)

adminRouter.post("/user/activate", authCtrl.activateUser)

adminRouter.get('/remove-unverified-users', authCtrl.removeUnverifiedUsers)

adminRouter.delete("/delete", adminCtr.deleteUserByIdOrEmail)

adminRouter.delete("/delete-all", adminCtr.deleteAllUsers)


// router.get("/:email", userHandlers.getUserByEmail)

// router.put("/:id", userHandlers.updateUserByID)

// router.put("/email", userHandlers.updateUserByEmail)



// adminRouter.post("/all", user.deleteAllUsers)





/* Transfers (Internal & External/Withdraw) Endpoints */

/* Deposit Endpoints  */


// router.post("/user/internal-transfer", userHandlers.internalTransfer)

/** Coinbase End Points */
// router.get("/coinbase", coinbaseHandlers.pay)

/** Authentication */
// router.post("/login", authenticationHandler.login)

// router.post("/signup", authenticationHandler.signup)


module.exports = adminRouter