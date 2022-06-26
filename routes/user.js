const express = require("express")
const coinbaseHandlers = require("../endpoints/coinbase");
const userCtr = require('../endpoints/user')
const { userAuth } = require("../middlewares/auth")


const userRouter = express.Router()


/** User End Points */

// userRouter.get("/user", userCtr.getAllUsers)

// userRouter.post("/signup", userCtr.signup);

// userRouter.get("/resend-verification-link", userCtr.resendVerificationLink);

// userRouter.get("/verify-account", userCtr.verifyAccount);

// userRouter.post("/signin", userCtr.signin);

// userRouter.post("/refreshtoken", userCtr.refreshtoken);

// userRouter.post("/reset-pass-request", userCtr.resetPassRequest);

// userRouter.post('/reset-pass', userCtr.resetPass)


// userRouter.delete("/:id", userCtr.deleteUserByID)

// userRouter.delete("/all", userCtr.deleteAllUsers)

// userRouter.post("/all", userCtr.deleteAllUsers)



/* Transfers (Internal & External/Withdraw) Endpoints */


/* Deposit Endpoints  */




// router.post("/user/internal-transfer", userHandlers.internalTransfer)


/** Coinbase End Points */
// router.get("/coinbase", coinbaseHandlers.pay)


/** Authentication */
// router.post("/login", authenticationHandler.login)

// router.post("/signup", authenticationHandler.signup)


module.exports = userRouter