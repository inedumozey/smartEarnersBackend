const mongoose = require('mongoose')
const User = mongoose.model("User");
const Config = mongoose.model("Config");
const PasswordReset = mongoose.model('PasswordReset');
require("dotenv").config();

const bcrypt = require("bcrypt");
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');
const jwt = require("jsonwebtoken");

const verificationLink = require('../utils/verificationLink');
const passResetLink = require('../utils/passResetLink');
const ran = require('../utils/randomString')
const { generateAccesstoken, generateRefreshtoken } = require('../utils/generateTokens')
const setCookie = require('../utils/setCookie');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)

module.exports ={

    getUsers: async (req, res)=> {
        try{
           const users = await User.find({}).populate({path: 'referree'}).populate({path: 'referrerId'});
           return res.status(200).json({ status: true, msg: "successfull", data: users})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    getUser: async (req, res)=> {
       try{
        const {id } = req.params;
        const loggedUserId = req.user

        //check if id is mongoose valid id
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({status: false, msg: `User not found!`})
        }

        //find paramsUser
        const paramUser = await User.findOne({_id: id}).populate({path: 'referree'}).populate({path: 'referrerId'});
        if(!paramUser) res.status(404).json({status: false, msg: `User not found!`});

        //find loggeduer
        const loggedUser = await User.findOne({_id: loggedUserId})

        // if loggedUser is not the owner of the paramsId or not the admin, send error
        if(!loggedUser.isAdmin && (id !=loggedUserId)){
            return res.status(500).send({ status: false, msg: "Access denied"})

        }
        // send the user      
        return res.status(200).json({status: true, msg: 'successfull', data: paramUser});
       }

       catch(err){
            res.status(500).send({ status: false, msg: "Server error, please contact customer service"})
       }
    },

    signup: async(req, res)=>{
        try{

            // sanitize all elements from the client, incase of fodgery
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
                
            }
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
            
            // get currency and verifyEmail from config data if exist otherwise set to the one in env
            // get all config
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;


            const resolveEnvVerifyEmail =()=>{
                return process.env.VERIFY_EMAIL === 'yes' ? 'yes' : 'no'
            };

            const verifyEmail = config && config.length >= 1 ? config[0].verifyEmail : resolveEnvVerifyEmail()
            
            //save data to database
            const user = new User({
                email,
                username,
                token: verifyEmail==='yes' ? ran.token() : "",
                isVerified: verifyEmail==='yes' ? false : true,
                accountNumber: ran.acc(),
                referralCode: ran.referralCode(),
                password: hashedPass,
                currency,
                hasInvested: false,
                firstInvestmentPlanValue: null,
                hasReturnedReferralRewards: false
            })
        
            //send account activation link to the user
            if(verifyEmail==='yes'){
                verificationLink(user, res, refcode);
            }
            else{
                const accesstoken = generateAccesstoken(user._id);
                const refreshtoken = generateRefreshtoken(user._id);

                setCookie(accesstoken, refreshtoken, res);
                const newUser = await user.save();

                // referral
                if(refcode){
                    const referringUser = await User.findOne({referralCode: refcode})
                    if(referringUser){

                        // add user as referree to the referring user
                        await User.findByIdAndUpdate({_id: referringUser._id}, {$push: {
                            referree: newUser._id,
                        }})

                        // add the referring user as referrer to this current user
                        await User.findByIdAndUpdate({_id: newUser.id}, {$set: {
                            referrerId: referringUser.id
                        }})
                    }
                }
                
                return res.status(200).json({status: true, msg: "You are registerd successfully"})
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

            if(user.isBlocked){
                return res.status(402).json({status: false, msg: "This account is blocked, please contact customer service"})
            }

            if(user.isVerified){
                return res.status(402).json({status: false, msg: "Your account has already been verified"})
            }
            
            // send verification link
            verificationLink(user, res)
        }
        catch(err){
            return res.status(505).json({status: false, msg: "Server error, please contact customer service"});
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
                            
                }
                if(user.isBlocked){
                    return res.status(402).json({status: false, msg: "This account is blocked, please contact customer service"})
                }
                
                if(user.isVerified){
                    return res.status(200).json({status: true, msg: "Your account is already verified", isVerified: user.isVerified})
                }

                user.isVerified = true;
                user.token = "";
                setTimeout(async()=> await user.save(), 1000);

                return res.status(200).json({status: true, msg: "Your account is verified", isVerified: user.isVerified})
            }
        }
        catch(err){
            res.status(500).json({ status: false, message: "Server error, please contact customer service"})
        }
    },
    
    signin: async(req, res)=>{
        try{
            const {email, password} = req.body;

            if(!email || !password){
                return res.status(400).json({status: false, msg: "All fields are required!"});

            }
            else{
                // find user with username or email
                const user = await User.findOne({$or: [{email}, {username: email}]});

                if(!user){
                    return res.status(400).json({status: false, msg: "User not found"});
                }
                
                // check if user is blocked
                if(user.isBlocked){
                    return res.status(402).json({status: false, msg: "This account is blocked, please contact customer service"})
                }

                // match provided password with the one in database
                const match = await bcrypt.compare(password.toString(), user.password)
            
                if(!match){
                    return res.status(400).json({status: false, msg: "Invalid login credentials"});
                }

                // log the user in
                const accesstoken = generateAccesstoken(user._id);
                const refreshtoken = generateRefreshtoken(user._id);

                setCookie(accesstoken, refreshtoken, res);

                return res.status(200).json({status: true, msg: "You are logged in"})
            }
        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer service"});
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
            
            if(!token){
                return res.status(400).json({status: false, msg: "User not authenticated! Please login or register"});
            }

            //validate token
            const data = await jwt.verify(token, process.env.JWT_REFRESH_SECRET);
                
            if(!data){
                return res.status(400).json({status: false, msg: "Invalid token! Please login or register"});
            }
           
            // find the user
            const user = await User.findOne({_id: data.id});

            // check if user is blocked
            if(user.isBlocked){
                return res.status(402).json({status: false, msg: "This account is blocked, please contact customer service"})
            }

            // generate new accesstoken and refreshtoken and send to the client cookie
            const accesstoken = generateAccesstoken(user._id);
            const refreshtoken = generateRefreshtoken(user._id);

            setCookie(accesstoken, refreshtoken, res);

            return res.status(200).json({status: true, msg: "Access token refreshed"})
        }
        catch(err){
            if(err.message == 'invalid signature' || err.message == 'invalid token'){
                return res.status(402).json({status: false, msg: "You are not authorized! Please login or register"})

            }
            if(err.message === "jwt expired"){
                return res.status(400).json({ status: false, message: "You are not authorized: Please login or register"})
            }
            return res.status(505).json({status: false, msg: "Server error, please contact customer service"});
        }
    },

    resetPassRequest: async(req, res)=>{
        try{
            const {email} = req.body;

            if(!email){
                return res.status(400).json({status: false, msg: "The field is required!"});
            }

            // get the user
            const user = await User.findOne({$or: [{email}, {username: email}]});

            if(!user){
                return res.status(400).json({status: false, msg: "User not found! Please register"});
            }

            // check if user is blocked
            if(user.isBlocked){
                return res.status(402).json({status: false, msg: "This account is blocked, please contact customer service"})
            }

             // get verifyEmail from config data if exist otherwise set to the one in env

            // get all config
            const config = await Config.find({});

            const resolveEnvVerifyEmail =()=>{
                return process.env.VERIFY_EMAIL === 'yes' ? 'yes' : 'no'
            };
            
            const verifyEmail = config && config.length >= 1 && config[0].verifyEmail ? config[0].verifyEmail : resolveEnvVerifyEmail()


            // check if verifyEmail is et to yes, send link to email, otherwise bypass email verification

            if(verifyEmail === 'yes'){
                // check passwordReset collection if user already exist, then update the token
                const oldUser = await PasswordReset.findOne({userId: user._id})
                    
                if(oldUser){
                    const passwordReset = await PasswordReset.findOneAndUpdate({userId: user._id}, {$set: {token: ran.resetToken()}}, {new: true});
                    const data = {email: user.email, passwordReset}
                    passResetLink(data, res);
                }

                // otherwise generate and save token and also save the user             
                const passwordReset = new PasswordReset({
                    token: ran.resetToken(),
                    userId: user._id
                })

                await passwordReset.save()
                const data = {email: user.email, passwordReset}
                passResetLink(data, res);
            }
            else{

                // bypass email verification and sending token to PasswordReset databse, send the token to client so that it can be passed to as query string
                const oldUser = await PasswordReset.findOne({userId: user._id})
                    
                if(oldUser){
                    const passwordReset = await PasswordReset.findOneAndUpdate({userId: user._id}, {$set: {token: ran.resetToken()}}, {new: true});
                }

                // otherwise generate and save token and also save the user             
                const passwordReset = new PasswordReset({
                    token: ran.resetToken(),
                    userId: user._id
                })

                await passwordReset.save()

                return res.status(200).json({status: true, msg: "Reset your password", token: passwordReset.token});
            }
                        
        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer service"});
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

            // check if user is blocked
            if(user.isBlocked){
                return res.status(402).json({status: false, msg: "This account is blocked, please contact customer service"})
            }
            
            // 1. remove the token from PasswordReset model
            await PasswordReset.findOneAndUpdate({user: token_.user}, {$set: {token: ""}})
            
            // 2. update user model with password
            const hashedPass = await bcrypt.hash(data.password, 10);

            await User.findOneAndUpdate({_id: token_.user}, {$set: {password: hashedPass}}, {new: true});

            // login the user
            const accesstoken = generateAccesstoken(user._id);
            const refreshtoken = generateRefreshtoken(user._id);

            setCookie(accesstoken, refreshtoken, res);
            
            return res.status(200).json({status: true, msg: "Password Changed and you logged in"})
        }   
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer service"});
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
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    updatePhone: async (req, res)=> {
        try{
            const loggedUserId = req.user
            const phone = DOMPurify.sanitize(req.body.phone);

            // update the user with the phone number
            const user = await User.findByIdAndUpdate({_id: loggedUserId}, {$set: {
                phone
            }}, {new: true})

            return res.status(200).json({status: true, msg: "Profile has been updated", data: user});
        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer service"})
        }
    }, 

    updateAvater: async (req, res)=> {
        try{
            const loggedUserId = req.user
            const { avater } = req.body;

            // update the user with the phone number
            const user = await User.findByIdAndUpdate({_id: loggedUserId}, {$set: {
                avater: avater
            }}, {new: true})

            return res.status(200).json({status: true, msg: "Profile has been updated", data: user});
        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact the customer service"})
        }
    },

    blockUser: async (req, res)=> {
        try{
            let {id} = req.params

            //check if id is mongoose valid id
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "User does not exist"})
            }
            
            // Find and block user, user most not be the admin
            const user_ = await User.findOne({_id: id})
            if(!user_){
                return res.status(400).json({status: false, msg: "User not found"})
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

                return res.status(200).json({status: true, msg: "User has been blocked", data: user})
            }
        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer service"})
        }
        
    },

    unblockUser: async (req, res)=> {
        try{
            let {id} = req.params

            //check if id is mongoose valid id
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "User does not exist"})
            }
            
            // Find and unblock user
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

                return res.status(200).json({status: true, msg: "User has been unblocked", data: user});

        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer service"})
        }
        
    },
    
    removeUnverifiedUsers: async (req, res)=> {
        try{
            // get expiresIn from config data if exist otherwise set to 0

            // get all config
            const config = await Config.find({});
            const time = config && config.length >= 1 && config[0].unverifyUserLifeSpan ? config[0].unverifyUserLifeSpan : 0
    
            const expiresIn = parseInt(time); // time is in seconds
  
            if(!time || time <= 0){
                return res.status(200).json({status: true, msg: "Unverified users allowed to stay"})
            }

            const currentTime = new Date().getTime() / 1000 // seconds

            //get all users
            const users = await User.find({})

            //loop through them and get the ids of unverified users that have stayed beyound welcome, none of these should be admin
            let ids = []
            for(let user of users){
                const createdTime = new Date(user.createdAt).getTime() / 1000 // seconds

                if(!user.isVerified && !user.isAdmin && currentTime - createdTime >= expiresIn){
                    ids.push(user._id.toString())
                }
            }

            // delete the users
            await User.deleteMany({isVerified: false})

            // delete all their deposit hx
            //...await User.deleteMany({userId_: ids})

            // delete all their withdrawal hx
            //...await User.deleteMany({userId_: ids})

            // delete all their internal transfer hx
            //...await User.deleteMany({userId_: ids})

            // delete all their investment hx
            //...await User.deleteMany({userId_: ids})


            return res.status(200).json({status: true, msg: "Unverified Users removed successfully"})
            
        }
        catch(err){
            return res.status(500).json({status: false, msg: err.message})
        }
    },

    deleteAccount: async (req, res)=> {
        try{
            const {id } = req.params;
            const loggedUserId = req.user

            //check if id is mongoose valid id
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: `User not found!`})
            }

            //find paramsUser
            const paramUser = await User.findOne({_id: id});
            if(!paramUser) res.status(404).json({status: false, msg: `User not found!`});

            //find loggeduser
            const loggedUser = await User.findOne({_id: loggedUserId})

            // if loggedUser is not the owner of the paramsId or not the admin, send error
            if(!loggedUser.isAdmin && (id !=loggedUserId)){
                return res.status(500).send({ status: false, msg: "Access denied"})
            }
                
            // Find and delete the account 
            const user = await User.findByIdAndDelete({_id: id})

            // delete his deposit hx
            //...await User.findByIdAndDelete({userId_: id})

            // delete his withdrawal hx
            //...await User.findByIdAndDelete({userId_: id})

            // delete his internal transfer hx
            //...await User.findByIdAndDelete({userId_: id})

            // delete his investment hx
            //...await User.findByIdAndDelete({userId_: id})

            return res.status(200).json({status: true, msg: "User has been deleted", data: user});

        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer service"})
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

            // delete all users
            await User.deleteMany({_id: ids})

             // delete all their deposit hx
            //...await User.deleteMany({userId_: ids})

            // delete all their withdrawal hx
            //...await User.deleteMany({userId_: ids})

            // delete all their internal transfer hx
            //...await User.deleteMany({userId_: ids})

            // delete all their investment hx
            //...await User.deleteMany({userId_: ids})


            return res.status(200).json({status: true, msg: "All users have been deleted"})

        }
        catch(err){
            return res.status(500).json({status: false, msg: "Server error, please contact customer service"})
        } 
    },
    
}