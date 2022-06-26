// const mongoose = require("mongoose")
const Deposit = require("../models/depositModel")

module.exports = {

    // Make Deposit
    deposit: async (req, res)=> {
        let { amount } = req.body

        let response = Boolean(amount.trim()) ? {status: false, message: "Invalid amount: empty amount" }
        : !(Number(amount) > 0) ? {status: false, message: "Invalid amount" }
        :  req.user ? { status: false, message: "Access denied: signin first" }
        : null;

        if(Boolean(response))
            res.status(400).json(response)

        var userID = req.user 
        new Deposit({ user: userID, amount: Number(amount)}).save()

        return res.status(200).json({status: true, message: "Deposited successfull"}) 
    }
}