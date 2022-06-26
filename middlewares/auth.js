const User = require("../models/user")
const jwt = require("jsonwebtoken");
require("dotenv").config();


module.exports ={

        userAuth: async(req, res, next)=> {
            // Get, access token from header
            try{
                const authString = req.headers["authorization"]

                if(!authString){
                    return res.status(400).json({status: false, message: "You are not authorize, please login or register"})
                }

                //get token
                const token = authString.split(" ")[1]
                
                // Verify token
                const data = await jwt.verify(token, process.env.JWT_ACCESS_SECRETE)
                if(!data){
                    return res.status(400).json({status: false, message: "You are not authorize, please login or register"})
                }

                //check if user is blocked
                if(data.isBlocked){
                    return res.status(400).json({status: false, message: "Your account is blocked, contact customer service"})
                }

                // Use the data to get the user from User collection
                const user = await User.findOne({_id: data.id })
                req.user = user._id
                next()
                
            }
            catch(err){
                if(err.message === "jwt epired"){
                    res.status(400).json({ status: false, message: "User not authorized: Please login or register"})
                }
                res.status(500).json({ status: false, message: err.message})
            }
        },


        adminAuth: async(req, res, next)=> {
             // Get access token from header
             try{
                const authString = req.headers["authorization"]

                if(!authString){
                    return res.status(400).json({status: false, message: "You are not authorize, please login or register"})
                }

                //get token
                const token = authString.split(" ")[1]
                
                // Verify token
                const data = await jwt.verify(token, process.env.JWT_ACCESS_SECRETE)
                if(!data){
                    return res.status(400).json({status: false, message: "You are not authorize, please login or register"})
                }
                // Use the data to get the user from User collection
                const user = await User.findOne({_id: data.id })
                if(user.isAdmin === true){
                    req.user = user._id
                    next()
                } 
                else {
                    return res.status(400).json({status: false, message: "You are not authorize, please login as Admin"})
                }
               
            }
            catch(err){
                if(err.message === "jwt epired"){
                    res.status(400).json({ status: false, message: "User not authorized: Please login or register"})
                }
                res.status(500).json({ status: false, message: err.message})
            }

        }
}