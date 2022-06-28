const mongoose = require('mongoose')
const User = mongoose.model("User");
const jwt = require("jsonwebtoken");
require("dotenv").config();


module.exports ={

    userAuth: async(req, res, next)=> {
        // Get, access token from header
        try{
            const authToken = req.headers["authorization"];
           
            if(!authToken){
                return res.status(400).json({status: false, msg: "You are not authorize, please login or register"})
            }
            // Verify token
            const token =authToken.split(" ")[1]

            const data = await jwt.verify(token, process.env.JWT_ACCESS_SECRET)
            if(!data){
                return res.status(400).json({status: false, msg: "You are not authorize, please login or register"})
            }

            // Use the data to get the user from User collection
            const user = await User.findOne({_id: data.id });

            if(!user){
                return res.status(400).json({status: false, msg: "You are not authorize, please login or register"})
            }

            //check if user is blocked
            if(user.isBlocked){
                return res.status(400).json({status: false, msg: "This account is blocked, contact the customer service"})
            }

            req.user = user._id
            next()
        }
        catch(err){
            if(err.message == 'invalid signature' || err.message == 'invalid token'){
                return res.status(402).json({status: false, msg: "You are not authorized! Please login or register"})

            }
            if(err.message === "jwt expired"){
                return res.status(400).json({ status: false, msg: "You are not authorized: Please login or register"})
            }
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    adminAuth: async(req, res, next)=> {
            // Get access token from header
            try{
            const authToken = req.headers["authorization"];
           
            if(!authToken){
                return res.status(400).json({status: false, msg: "You are not authorize, please login or register"})
            }
            // Verify token
            const token =authToken.split(" ")[1]

            // Verify token
            const data = await jwt.verify(token, process.env.JWT_ACCESS_SECRET)

            if(!data){
                return res.status(400).json({status: false, msg: "You are not authorize, please login or register"})
            }

            // Use the data to get the user from User collection
            const user = await User.findOne({_id: data.id });
            if(!user){
                return res.status(400).json({status: false, msg: "You are not authorize, please login or register"})
            }

            if(user.isAdmin){
                req.user = user._id
                next()
            } 
            else {
                return res.status(400).json({status: false, msg: "You are not authorize, please login as Admin"})
            }
        }
        catch(err){
            if(err.message == 'invalid signature' || err.message == 'invalid token'){
                return res.status(402).json({status: false, msg: "You are not authorized! Please login or register"})

            }
            if(err.message === "jwt expired"){
                return res.status(400).json({ status: false, msg: "User not authorized: Please login or register"})
            }
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    verifiedUserAuth: async(req, res, next)=> {
        // Get access token from header
        try{
        const authToken = req.headers["authorization"];
       
        if(!authToken){
            return res.status(400).json({status: false, msg: "You are not authorize, please login or register"})
        }
        // Verify token
        const token =authToken.split(" ")[1]

        // Verify token
        const data = await jwt.verify(token, process.env.JWT_ACCESS_SECRET)

        if(!data){
            return res.status(400).json({status: false, msg: "You are not authorize, please login or register"})
        }

        // Use the data to get the user from User collection
        const user = await User.findOne({_id: data.id });
        if(!user){
            return res.status(400).json({status: false, msg: "You are not authorize, please login or register"})
        }

        if(user.isVerified){
            req.user = user._id
            next()
        } 
        else {
            return res.status(400).json({status: false, msg: "Your account is not verified"})
        }
    }
    catch(err){
        if(err.message == 'invalid signature' || err.message == 'invalid token'){
            return res.status(402).json({status: false, msg: "You are not authorized! Please login or register"})

        }
        if(err.message === "jwt expired"){
            return res.status(400).json({ status: false, msg: "User not authorized: Please login or register"})
        }
        return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
    }
}
}