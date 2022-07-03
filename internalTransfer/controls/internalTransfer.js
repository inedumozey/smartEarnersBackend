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


             // resolve withdrawal factors incase it's not in the database
             const resolveWithdrawalFactors =()=>{
                let factors=[]
                const maxWithdrawalLimit = process.env.MAX_WITHDRAWAL_LIMIT ? Number(process.env.MAX_WITHDRAWAL_LIMIT) : 100000;
                const minWithdrawalLimit = process.env.MIN_WITHDRAWAL_LIMIT ? Number(process.env.MIN_WITHDRAWAL_LIMIT) : 5000;
                const withdrawalCommomDiff = process.env.WITHDRAWAL_COMMON_DIFF ? Number(process.env.WITHDRAWAL_COMMON_DIFF) : 5000;

                for(let i=minWithdrawalLimit; i<=maxWithdrawalLimit; i=i+withdrawalCommomDiff){
                    factors.push(i)
                }
                return factors
            }

            // get currency, maxWithdrawalLimit, minWithdrawalLimit and withdrawalCommomDifference from config data if exist otherwise set to the one in env

            // get all config
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : (process.env.NATIVE_CURRENCY).toUpperCase();

            const withdrawalFactors = config && config.length >= 1 && config[0].withdrawalFactors ? config[0].withdrawalFactors : resolveWithdrawalFactors();

            if(!withdrawalFactors.includes(data.amount)){
                return res.status(400).json({ status: false, msg: "Invalid amount"});
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
                username: rUser.username,
                email: rUser.email,
                accountNumber: rUser.accountNumber,
                amount: data.amount.toFixed(8),
                currency: currency
            }

            // send confirmation msg to the sender
            return res.status(200).json({ status: true, msg: "confirmed", data: info})        
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    payUser: async (req, res)=> {
        try{
            const userId = req.user

            // sanitize all elements from the client, incase of fodgery
            const data = {
                amount: Number(DOMPurify.sanitize(req.body.amount)),
                accountNumber: DOMPurify.sanitize(req.body.accountNumber),
            }

            if(!data.amount || !data.accountNumber){
                return res.status(500).json({ status: false, msg: "All fields are required"})
            }

            // check widthdrawal factors

            // resolve withdrawal factors incase it's not in the database
            const resolveWithdrawalFactors =()=>{
                let factors=[]
                const maxWithdrawalLimit = process.env.MAX_WITHDRAWAL_LIMIT ? Number(process.env.MAX_WITHDRAWAL_LIMIT) : 100000;
                const minWithdrawalLimit = process.env.MIN_WITHDRAWAL_LIMIT ? Number(process.env.MIN_WITHDRAWAL_LIMIT) : 5000;
                const withdrawalCommomDiff = process.env.WITHDRAWAL_COMMON_DIFF ? Number(process.env.WITHDRAWAL_COMMON_DIFF) : 5000;

                for(let i=minWithdrawalLimit; i<=maxWithdrawalLimit; i=i+withdrawalCommomDiff){
                    factors.push(i)
                }
                return factors
            }

            // get currency, maxWithdrawalLimit, minWithdrawalLimit and withdrawalCommomDifference from config data if exist otherwise set to the one in env
            // get all config
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;

            const withdrawalFactors = config && config.length >= 1 && config[0].withdrawalFactors ? config[0].withdrawalFactors : resolveWithdrawalFactors();

            // check for withdrawal factors
            if(!withdrawalFactors.includes(data.amount)){
                return res.status(400).json({ status: false, msg: "Invalid amount"});
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

            const rUser = await User.findOne({accountNumber: data.accountNumber});

            // validate the account number
            if(!rUser){
                return res.status(500).json({ status: false, msg: "Invalid account number"})
            };

            // check to be sure account number does not belongs to the sender
            if(rUser.accountNumber === user.accountNumber){
                return res.status(500).json({ status: false, msg: "You cannot transfer to yourself"})
            }
 
            //.........................................................

            // handle transactions
            // 1. add the amount to the receiver's account
            await User.findByIdAndUpdate({_id: rUser.id}, {$set: {
                amount: (rUser.amount + data.amount).toFixed(8)
            }}, {new: true})

            // 2. remove the amount from sender's account
            await User.findByIdAndUpdate({_id: userId}, {$set: {
                amount: (user.amount - data.amount).toFixed(8)
            }}, {new: true})

            // 3 save data into internal transfer database (transaction) of the sender            

            const newInternalTransfer = new InternalTransfer({
                senderId: userId,
                receiverId: rUser.id,
                accountNumber: data.accountNumber,
                amount: data.amount.toFixed(8),
                currency,
            })

            await newInternalTransfer.save()

            return res.status(200).json({ status: true, msg: `Transaction successful`, data: newInternalTransfer}) 
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    },

    getAllTransactions: async (req, res)=> {
        try{
            const userId = req.user;

            // get the transaction hx
            const txns = await InternalTransfer.find({});

            // get the loggeduser to check if he is the admin
            const loggeduser = await User.findOne({_id: userId})
            
            // if admin, send all the txns
            if(loggeduser.isAdmin){
                const txnsData = await InternalTransfer.find({}).populate({path: 'senderId'}).populate({path: 'receiverId'});

                return res.status(200).send({status: true, msg: 'Successful', data: txnsData})
            }

            else{

                // check if non admin loggedUser is the sender or receiver, then send only his tnxs
                let ids = []
                for(let txn of txns){
                    if(txn.senderId.toString() === userId.toString() || txn.receiverId.toString() === userId.toString()){
                        ids.push(txn._id)
                    }
                }

                const txnsData = await InternalTransfer.find({_id: ids}).populate({path: 'senderId'}).populate({path: 'receiverId'});
                return res.status(200).send({status: true, msg: 'Successful', data: txnsData})
            }
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
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
            
            // send the txn he requested
            if(loggeduser.isAdmin){
                const txnData = await InternalTransfer.findOne({_id: id}).populate({path: 'senderId'}).populate({path: 'receiverId'})

                return res.status(200).send({status: true, msg: 'Successful', data: txnData})
            }

            // check if non admin loggeduser was the one that did the transfer he requets for
            else if(txn.senderId.toString() === userId.toString() || txn.receiverId.toString() === userId.toString()){
                const txnData = await InternalTransfer.findOne({_id: id}).populate({path: 'senderId'}).populate({path: 'receiverId'})

                return res.status(200).send({status: true, msg: 'Successful', data: txnData})
            }

            // if none of the above, send error
            else{
                return res.status(400).send({status: false, msg: 'Access denied'})
            }

        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer support"})
        }
    }
}