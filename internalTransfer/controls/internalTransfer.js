const mongoose = require('mongoose')
const InternalTransfer = mongoose.model("InternalTransfer");
const User = mongoose.model("User");
const Config = mongoose.model("Config");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)


module.exports ={
        
    checkUser: async (req, res)=> {
        try{
            const userId = req.user

            // sanitize all elements from the client, incase of fodgery
            const data = {
                amount:  parseInt(DOMPurify.sanitize(req.body.amount)),
                accountNumber:  DOMPurify.sanitize(req.body.accountNumber),
            }

            if(!data.amount || !data.accountNumber){
                return res.status(500).json({ status: false, msg: "All fields are required"})
            }
            // get sender's total amount
            const user = await User.findOne({_id: userId})
            if(!user){
                return res.status(500).json({ status: false, msg: "User not found!"})
            }

            // check sender's amount, if less than what he is transfering, send error
            if(parseInt(data.amount) > parseInt(user.amount)){
                return res.status(500).json({ status: false, msg: "Insufficient balance"})
            }

            // get the receiver using the account number
            const rUser = await User.findOne({accountNumber: data.accountNumber});

            // validate the account number
            if(!rUser){
                return res.status(500).json({ status: false, msg: "Invalid account number"})
            };

            // check to be sure account number does not belongs to the sender
            if(rUser.accountNumber === user.accountNumber){
                return res.status(500).json({ status: false, msg: "You cannot do transfer to yourself"})
            }

            const info = {
                id: rUser._id,
                username: rUser.username,
                email: rUser.email,
                accountNumber: rUser.accountNumber,
                amount: data.amount,
                currency: rUser.currency
            }

            // send confirmation msg to the sender
            return res.status(200).json({ status: true, msg: "confirmed", data: info})        
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    payUser: async (req, res)=> {
        try{
            const userId = req.user

            // sanitize all elements from the client, incase of fodgery
            const data = {
                amount:  parseInt(DOMPurify.sanitize(req.body.amount)),
                id:  DOMPurify.sanitize(req.body.id),
            }

            if(!data.amount || !data.id){
                return res.status(500).json({ status: false, msg: "Data is mising"})
            }

             // get sender's total amount
            const user = await User.findOne({_id: userId})
            if(!user){
                return res.status(500).json({ status: false, msg: "User not found!"})
            }

            // check sender's amount, if less than what he is transfering, send error
            if(parseInt(data.amount) > parseInt(user.amount)){
                return res.status(500).json({ status: false, msg: "Insufficient balance"})
            }

            // get the receiver using the account number
            if(!mongoose.Types.ObjectId.isValid(data.id)){
                return res.status(400).json({status: false, msg: "Receiver not found"})
            }

            const rUser = await User.findOne({_id: data.id});

            // validate the account number
            if(!rUser){
                return res.status(500).json({ status: false, msg: "Receiver not found"})
            };

            // check to be sure account number does not belongs to the sender
            if(rUser.accountNumber === user.accountNumber){
                return res.status(500).json({ status: false, msg: "You cannot do transfer to yourself"})
            }
 
            //..........................................................
        
            // handle transactions
            // 1. add the amount to the receiver's account
            await User.findByIdAndUpdate({_id: rUser.id}, {$set: {
                amount: rUser.amount + data.amount
            }}, {new: true})

            // 2. remove the amount from sender's account
            await User.findByIdAndUpdate({_id: userId}, {$set: {
                amount: user.amount - data.amount
            }}, {new: true})

            // 3 save data into internal transfer database (transaction) of the sender

            // get currency and verifyEmail from config data if exist otherwise set to the one in env
            // get all config
            const config = await Config.find({});

            const currency = config && config.length >= 1 ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;

            const newInternalTransfer = new InternalTransfer({
                userId,
                senderId: userId,
                amount: data.amount,
                currency,
                receiverId: rUser.id,
                accountNumber: data.accountNumber
            })

            await newInternalTransfer.save()

            return res.status(200).json({ status: true, msg: `Transaction successful`, data: newInternalTransfer}) 
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    getAllTransactions: async (req, res)=> {
        try{
            const userId = req.user;

            // get the transaction hx
            const txns = await InternalTransfer.find({});

            // get the loggeduser to check if he is the admin
            const loggeduser = await User.findOne({_id: userId})
            
            if(loggeduser.isAdmin){
                return res.status(200).send({status: true, msg: 'Successful', data: txns})
            }

            else{
                let data = []
                for(let txn of txns){
                    if(txn.userId.toString() === userId.toString()){
                        data.push(txn)
                    }
                }

                return res.status(200).send({status: true, msg: 'Successful', data})
            }
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    getTransaction: async (req, res)=> {
        try{
            const userId = req.user;
            const {id} = req.params;

            // check the id
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Transaction not found"})
            }

            // get the transaction hx
            const txn = await InternalTransfer.findOne({_id: id});
            if(!txn){
                return res.status(400).json({status: false, msg: "Transaction not found"})
            }

            // check if the loggeduser is the admin
            const loggeduser = await User.findOne({_id: userId})
            
            if(loggeduser.isAdmin){
                return res.status(200).send({status: true, msg: 'Successful',  type: 'transfer', data: txn})
            }

            // check if the loggeduser was the one that did the transfer
            else if(txn.senderId.toString() === userId.toString()){
                return res.status(200).send({status: true, msg: 'Successful', type: 'send', data: txn})
            }

            // check if the loggeduser was the one that received the transfer
            else if(txn.receiverId.toString() === userId.toString()){
                return res.status(200).send({status: true, msg: 'Successful', type: 'receive', data: txn})
            }

            // if none of the above, send error
            else{
                return res.status(400).send({status: false, msg: 'Access denied'})
            }

        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    }
}