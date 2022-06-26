const mongoose = require('mongoose')
const User = mongoose.model("User");
const PasswordReset = mongoose.model('PasswordReset');
// const ReferralReward = mongoose.model('ReferralReward');

const bcrypt = require("bcrypt");
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const jwt = require("jsonwebtoken");
const verificationLink = require('../utils/verificationLink');
const passResetLink = require('../utils/passResetLink');
const ran = require('../utils/randomString')
const { generateAccesstoken, generateRefreshtoken } = require('../utils/generateTokens')
const setCookie = require('../utils/setCookie')

require("dotenv").config();

const VERIFY_EMAILS = Boolean(process.env.VERIFY_EMAILS);

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)


module.exports ={

    getUsers: async (req, res)=> {
        try{
           const users = await User.find({});
           res.status(200).json({ status: true, msg: "successfull", users})
        }
        catch(err){
            res.status(500).json({ status: false, msg: err.message})
        }
    },

    getUser: async (req, res)=> {
       try{
        const {id } = req.params;

        //check if id is mongoose valid id
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({status: false, msg: `User not found!`})
        }

        //find user
        const user = await User.find({_id: id});

        if(!user) res.status(404).json({status: false, msg: `User not found!`});

        res.status(200).json({status: true, msg: 'successfull', user});
       }

       catch(err){
            res.status(500).send({ status: false, msg: "Server error, please contact the admin"})
       }
    },

    signup: async(req, res)=>{
        try{

            const refcode = DOMPurify.sanitize(req.query.refcode);
            const data = {
                password:  DOMPurify.sanitize(req.body.password),
                cpassword: DOMPurify.sanitize(req.body.cpassword),
                username: DOMPurify.sanitize(req.body.username),
                email: DOMPurify.sanitize(req.body.email),
            }

            const { email, username, password, cpassword } = data;
            if(!email || !password || !cpassword || !username){
                return res.status(400).json({status: false, msg: "Fill all required fields!"});

            }
            else if(password !== cpassword){
                return res.status(405).json({status: false, msg: "Passwords do not match!"});
                
            }else{

                //check for already existing email and username
                const oldUser = await User.findOne({email});
                const oldUsername = await User.findOne({username});
                
                if(oldUser){
                    return res.status(409).json({status: false, msg: "Email already exist!"});

                }
                if(oldUsername){
                    return res.status(409).json({status: false, msg: "Username already taken!"});
                }

                //hash the password
                const hashedPass = await bcrypt.hash(password, 10);
                
                //save data to database
                const user = new User({
                    email,
                    username,
                    token: VERIFY_EMAILS ? ran.token() : "",
                    isVerified: VERIFY_EMAILS ? false : true,
                    accountNumber: ran.acc(),
                    referralCode: ran.referralCode(),
                    password: hashedPass
                })

                if(refcode){
                    const referringUser = await User.findOne({referralCode: refcode})
                    if(referringUser){
                        await User.findByIdAndUpdate({_id: referringUser._id}, {$push: {
                            referree: user._id
                        }})
                    }
                }
            
                //send account activation link to the user
                if(VERIFY_EMAILS){
                    verificationLink(user, res);

                }else{
                    const accesstoken = generateAccesstoken(user._id);
                    const refreshtoken = generateRefreshtoken(user._id);

                    setCookie(accesstoken, refreshtoken, res);
                    await user.save();
                    
                    return res.status(200).json({status: true, msg: "You are registerd successfully"})
                }
            }
        }
        catch(err){
            return res.status(500).json({status: false, msg: err.message});
        }
    },

    resendVerificationLink: async(req, res)=>{
        try{
            const userId = req.user;
           
            if(!userId){
                return res.status(402).json({status: false, msg: "User not found"})

            }

            // fetch user
            const user = await User.findOne({_id: userId})

            if(user.isVerified){
                return res.status(402).json({status: false, msg: "Your account has already been verified"})
            }
            
            // send verification link
            verificationLink(user, res)
        }
        catch(err){
            return res.status(505).json({status: false, msg: "Server error! Please contact the customer service"});
        }
    },

    verifyAccount: async(req, res)=>{
        try{
            const {token} = req.query

            if(!token){
                return res.status(400).json({status: false, msg: "Token is missing!"})
            }else{
                //search token in the database
                const user = await User.findOne({token})
                if(!user){
                    return res.status(400).json({status: false, msg: "Invalid token"})
                            
                }else{
                    if(user.isVerified){
                        return res.status(200).json({status: true, msg: "Your account is already verified", isVerified: user.isVerified})
                    }

                    user.isVerified = true;
                    user.token = "";
                    setTimeout(async()=> await user.save(), 1000);

                    return res.status(200).json({status: true, msg: "Your account is verified", isVerified: user.isVerified})
                }
            }
        }
        catch(err){
            res.status(500).json({ status: false, message: err.message})
        }
    },
    
    signin: async(req, res)=>{
        try{
            const {email, password} = req.body;

            if(!email || !password){
                return res.status(400).json({status: false, msg: "All fields are required!"});

            }
            else{
                const user = await User.findOne({$or: [{email}, {username: email}]});

                if(!user){
                    return res.status(400).json({status: false, msg: "User not found"});

                }else{
                    const match = await bcrypt.compare(password.toString(), user.password)
                
                    if(!match){
                        console.log("password not match")
                        return res.status(400).json({status: false, msg: "Invalid login credentials"});

                    }else{
                        const accesstoken = generateAccesstoken(user._id);
                        const refreshtoken = generateRefreshtoken(user._id);

                        setCookie(accesstoken, refreshtoken, res);
        
                        return res.status(200).json({status: true, msg: "You are logged in"})
                    }
                }
            }
        }
        catch(err){
            return res.status(500).json({status: false, msg: err.message});
        }
    },

    generateAccesstoken: async(req, res)=>{
        try{
            //refresh token passed in req.body from client is used to refresh access token which will then be saved in client token
            const authToken = req.headers["authorization"];            
           
            if(!authToken){
                return res.status(400).json({status: false, message: "You are not authorize, please login or register"})
            }
            // Verify token
            const token =authToken.split(" ")[1]
            
            if(token){
                //validate token
                const data = await jwt.verify(token, process.env.JWT_REFRESH_SECRETE);
                
                if(!data){
                    return res.status(400).json({status: false, msg: "Invalid token! Please login or register"});
                }
                else{
                    //generate new access token and send to client as cookie
                    const user = await User.findOne({_id: data.id});

                    const accesstoken = generateAccesstoken(user._id);
                    const refreshtoken = generateRefreshtoken(user._id);

                    setCookie(accesstoken, refreshtoken, res);

                    return res.status(200).json({status: true, msg: "Access token refreshed", accesstoken})
                }

            }else{
                return res.status(400).json({status: false, msg: "User not authenticated! Please login or register"});
            }
        }
        catch(err){
            if(err.message == 'invalid signature' || err.message == 'invalid token'){
                return res.status(402).json({status: false, msg: "You are not authorized! Please login or register"})

            }
            if(err.message === "jwt expired"){
                return res.status(400).json({ status: false, message: "You are not authorized: Please login or register"})
            }
            return res.status(505).json({status: false, msg: "Server error, please contact the customer service"});
        }
    },

    resetPassRequest: async(req, res)=>{
        try{
            const {email} = req.body;

            if(!email){
                return res.status(400).json({status: false, msg: "The field is required!"});
            }
            const user = await User.findOne({$or: [{email}, {username: email}]});
            if(!user){
                return res.status(400).json({status: false, msg: "User not found! Please register"});
            }

            // check passwordReset collection if user already exist, then update the token
            const oldUser = await PasswordReset.findOne({userId: user._id})
                
            if(oldUser){
                const passwordReset = await PasswordReset.findOneAndUpdate({userId: user._id}, {$set: {token: ran.resetToken()}}, {new: true});
                const data = {email: user.email, passwordReset}
                passResetLink(data, res);

            }
            else{
                // otherwise generate and save token and also save the user             
                const passwordReset = new PasswordReset({
                    token: ran.resetToken(),
                    userId: user._id
                })

                await passwordReset.save()
                const data = {email: user.email, passwordReset}
                passResetLink(data, res);
            }
        }
        catch(err){
            return res.status(505).json({status: false, msg: err.message});
        }
    },

    resetPass: async(req, res)=>{
        try{
            const {token} = req.query;
            
            const data = {
                password:  DOMPurify.sanitize(req.body.password),
                cpassword: DOMPurify.sanitize(req.body.cpassword)
            }

            if(!data.password || !data.cpassword){
                return res.status(400).json({status: false, msg: "Fill all required fields!"});

            }
            if(data.password != data.cpassword){
                return res.status(405).json({status: false, msg: "Passwords do not match!"});
                
            }
            if(!token){
                return res.status(400).json({status: false, msg: "Token is missing!"})
            }

            //search token in the database 
            const token_ = await PasswordReset.findOne({token});

            if(!token_){
                return res.status(400).json({status: false, msg: "Invalid token"})
            }
                    
            //use the token to find the user
            const user = await User.findOne({_id: token_.userId})
            if(!user){
                return res.status(400).json({status: false, msg: "User not found"});
            }
            
            // 1. remove the token from PasswordReset model
            await PasswordReset.findOneAndUpdate({user: token_.user}, {$set: {token: ""}})
            
            // 2. update user model with password
            const hashedPass = await bcrypt.hash(data.password, 10);

            await User.findOneAndUpdate({_id: token_.user}, {$set: {password: hashedPass}}, {new: true});

            const accesstoken = generateAccesstoken(user._id);
            const refreshtoken = generateRefreshtoken(user._id);

            setCookie(accesstoken, refreshtoken, res);
            
            return res.status(200).json({status: true, msg: "Password Changed and you logged in"})
        }   
        catch(err){
            return res.status(505).json({status: false, msg: "Server error, please contact the customer service"});
        }
    },

    logout: async (req, res)=> {
        try{
        
            // clear refreshtoken from cookie
            res.clearCookie("accesstoken");
            res.clearCookie("refreshtoken");
            
            return res.status(200).json({ status: true, msg: "You have being Logged out"})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact the customer service"})
        }
    },

    blockUser: async (req, res)=> {
        try{
            let id = req.body.id

            //check if id is mongoose valid id
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "User does not exist"})
            }
            
            // Find and Deactivate user with his/her email or id, user most not be the admin
            const user_ = await User.findOne({_id: id})
            if(!user_){
                return res.status(400).json({status: false, msg: "User does not exist"})
            }
            if(user_.isAdmin){
                return res.status(400).json({status: false, msg: "Admin's account cannot be blocked"})

            }else{
                const user = await User.findOneAndUpdate({_id: id}, 
                {
                    $set: {
                        isBlocked: true
                    }
                }, 
                { new: true});

                return res.status(200).json({status: true, msg: "User has been blocked", user})
            }
        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact the customer service"})
        }
        
    },

    unblockUser: async (req, res)=> {
        try{
            let id = req.body.id

            //check if id is mongoose valid id
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "User does not exist"})
            }
            
            // Find and Deactivate user with his/her email or id, user most not be the admin
            const user_ = await User.findOne({_id: id})
            if(!user_){
                return res.status(400).json({status: false, msg: "User does not exist"})
            }
            const user = await User.findOneAndUpdate({$or : [{email:id}, {_id: id}]}, 
                {
                    $set: {
                        isBlocked: false
                    }
                }, 
                { new: true});

                return res.status(200).json({status: true, msg: "User has been unblocked", user});

        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact the customer service"})
        }
        
    },
    
    removeUnverifiedUsers: async (req, res)=> {
        try{
            const {time} = req.body
  
            if(!time || time <= 0){
                return res.status(200).json({status: true, msg: "Unverified users allowed to stay"})
            }

            const expiresIn = parseInt(time); // time is in seconds
            const currentTime = new Date().getTime() / 1000 / 60 // seconds

            const users = await User.find()

            //loop through users are remove all unverified users after the time provided is elapsed
            for(let user of users){
                const createdTime = new Date(user.createdAt).getTime() / 1000 / 60;

                if(!user.isVerified && currentTime - createdTime >= expiresIn){
                    await User.deleteMany({isVerified: false})
        
                    return res.status(200).json({status: true, msg: "Unverified Users removed successfully"})
                }else{
                    return res.status(200).json({status: true, msg: "Unverified Users removed successfully"})
                }
            }
        }
        catch(err){
            return res.status(500).json({status: false, msg: `Server error, please contact the customer service`})
        }
    },

    deleteAccount: async (req, res)=> {
        try{
            let {id} = req.params
            const userId = req.user

            //check if id is mongoose valid id
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "User does not exist"})
            }
            if(userId != id){
                return res.status(400).json({status: false, msg: "You are not allowed to delete an account that is not yours"}) 
            }
            
            // Find and Deactivate user with his/her email or id, user most not be the admin
            const user = await User.findByIdAndDelete({_id: id})
            return res.status(200).json({status: true, msg: "User has been deleted", user});

        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact the customer service"})
        }
        
    },

    deleteUser: async (req, res)=> {
        try{
            let {id} = req.params
            const userId = req.user

            //check if id is mongoose valid id
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "User does not exist"})
            }
        
            //chech if user is the admin
            const user_ = await User.findOne({_id: userId})

            if(!user_.isAdmin){
                return res.status(400).json({status: false, msg: "User are not allowed to delete this acount"})
            }
            
            // Find and delete this user from the database
            const user = await User.findByIdAndDelete({_id: id})
            return res.status(200).json({status: true, msg: "User has been deleted", user});

        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact the customer service"})
        }
        
    },

    deleteAllUsers: async (req, res)=> {
        try{
            // get all users
            const users = await User.find({})
            
            let ids = []
            for(let user of users){
                if(!user.isAdmin){
                    ids.push(user.id)
                }
            }
            const user = await User.deleteMany({_id: ids})
            return res.status(200).json({status: true, msg: "All users have been deleted"})

        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact the customer service"})
        } 
    },
}