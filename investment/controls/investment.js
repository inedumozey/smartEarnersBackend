const mongoose = require('mongoose')
const InvestmentPlan = mongoose.model("InvestmentPlan");
const Investment = mongoose.model("Investment");
const User = mongoose.model("User");
const Config = mongoose.model("Config");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)


module.exports ={
        
    getAllPlans: async (req, res)=> {
        try{
               const plans = await InvestmentPlan.find({}).sort({amount: 1});
               return res.status(200).json({ status: false, msg: "suucessful", data: plans})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    getPlan: async (req, res)=> {
        try{
            const {id} = req.params;

            // check id if exist
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            // chekc if the Plan exist
            const data_ = await InvestmentPlan.findOne({_id: id})
            if(!data_){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            const plan = await InvestmentPlan.find({_id: id});
            return res.status(200).json({ status: false, msg: "successful", data: plan})
                    
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    setPlan: async (req, res)=> {
        try{
            const data = {
                type:  DOMPurify.sanitize(req.body.type),
                amount:  parseInt(DOMPurify.sanitize(req.body.amount)),
                lifespan:  DOMPurify.sanitize(req.body.lifespan),
                returnPercentage:  DOMPurify.sanitize(req.body.returnPercentage),
            }

            // get currency from config data if exist otherwise set to the one in env
            // get all config.
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;

            // validate form input
            if(!data.type || !data.amount || !data.lifespan || !data.returnPercentage){
                return res.status(500).json({ status: false, msg: "All fields are required"});
            }

            // check to makesure plan types is not already in existance
            const investmentPlans = await InvestmentPlan.findOne({type: data.type});

            if(investmentPlans){
                return res.status(400).json({ status: false, msg: "Plan already exist"})
            }
            // save the data to the database
            const newInvestmentPlan = new InvestmentPlan({
                type: data.type,
                amount: data.amount,
                currency,
                lifespan: data.lifespan,
                returnPercentage: data.returnPercentage,
            })

            await newInvestmentPlan.save();

            return res.status(500).json({ status: false, msg: "successful", data: newInvestmentPlan})
                    
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    updatePlan: async (req, res)=> {
        try{
            const {id} = req.params;
            const data = {
                type:  DOMPurify.sanitize(req.body.type),
                amount:  parseInt(DOMPurify.sanitize(req.body.amount)),
                lifespan:  DOMPurify.sanitize(req.body.lifespan),
                returnPercentage:  DOMPurify.sanitize(req.body.returnPercentage),
            }

            // get currency from config data if exist otherwise set to the one in env
            // get all config.
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;

            // validate form input
            if(!data.type || !data.amount || !data.lifespan || !data.returnPercentage){
                return res.status(400).json({ status: false, msg: "All fields are required"});
            }

            // check id if exist
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            // chekc if the id exist
            const data_ = await InvestmentPlan.findOne({_id: id})
            if(!data_){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            // save the data to the database
            const planData = {
                type: data.type,
                amount: data.amount,
                currency,
                lifespan: data.lifespan,
                returnPercentage: data.returnPercentage,
            }
            
            const updatedData = await InvestmentPlan.findByIdAndUpdate({_id: id}, {$set: planData}, {new: true});

            return res.status(200).json({ status: true, msg: "plan updated", data: updatedData})  
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    deletePlan: async (req, res)=> {
        try{
            const {id} = req.params;

            // check id if exist
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            const deletedData = await InvestmentPlan.findByIdAndDelete({_id: id});

            if(!deletedData){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            return res.status(200).json({ status: true, msg: "Plan deleted", data: deletedData})  
                    
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    deleteAllPlans: async (req, res)=> {
        try{

            await InvestmentPlan.deleteMany({});

            const data = await InvestmentPlan.find({});

            return res.status(200).json({ status: true, msg: "All plans deleted", data})     
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    invest: async (req, res)=> {
        try{
            const {id} = req.params // planId past in params
            const userId = req.user;

            // check item if exist
            if(!mongoose.Types.ObjectId.isValid(id)){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            // check if the plan exist
            const data_ = await InvestmentPlan.findOne({_id: id})

            if(!data_){
                return res.status(400).json({status: false, msg: "Plan not found"})
            }

            // get currency from config data if exist otherwise set to the one in env
            // get all config.
            const config = await Config.find({});

            const currency = config && config.length >= 1 && config[0].nativeCurrency ? config[0].nativeCurrency : process.env.NATIVE_CURRENCY;

            // get all plans the user has
            const userPlans = await Investment.find({userId}).populate({path: 'planId'}); // array

            let count = 0;
            let samePlan = 0;

            // loop through all the investment the logged user has
            for(let userPlan of userPlans){

                // increament the count base on how many active investment he has running
                if(userPlan.isActive){
                    ++count
                }

                // check for active investment plans, if same with the plan he is requesting for currently, increament samePlan
                if(userPlan.planId.type === data_.type){
                    ++samePlan
                }
            }

            const investmentCount = config && config.length >= 1 && config[0].investmentCount? config[0].investmentCount : process.env.INVESTMENT_COUNT;

            // if count is more than, refuse him of further investment
            if(count >= investmentCount){
                return res.status(400).json({ status: false, msg: `You cannot have more than ${investmentCount} active investments`})
            }
            else{

                // no user should have same active plan for more than once
                if(samePlan >= 1){
                    return res.status(400).json({ status: false, msg: "You have this plan running already"})
                }
                else{
                    const data = {
                        planId: id,
                        userId,
                        rewarded: false,
                        rewards: 0,
                        currency,
                        isActive: true
                    }

                    const newInvestment = new Investment(data);
                    await newInvestment.save();

                    return res.status(200).json({ status: true, msg: `You have started investing for ${data_.type}`, data: newInvestment})
                }
                
            }
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    rewards: async (req, res)=> {
        try{
            
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },


}