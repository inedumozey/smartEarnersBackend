const mongoose = require('mongoose')
const Config = mongoose.model("Config");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)


module.exports ={

    getConfig: async (req, res)=> {
        try{
            // get all config
            const config = await Config.find({});

            // check if document is empty,
            if(config.length < 1){

                // create the default
                // create the default
                const benefits_ = 'benefit1,benefit2,benefit3,'
                const contacts_ = 'contact1,contact2,contact3,';
                const withdrawalCoins_ = 'LITECOIN,DOGECOIN,TRON,USDT(bep20),BUSD(bep20),';

                const benefits = process.env.BENEFITS ? process.env.BENEFITS : benefits_;
                const contacts = process.env.CONTACTS ? process.env.CONTACTS : contacts_;
                const withdrawalCoins = process.env.WITHDRAWAL_COINS ? process.env.WITHDRAWAL_COINS : withdrawalCoins_;

                // convert benefits and contacts into array
                const resolveArr =(string)=>{
                    const data = string.split(',')
                    const dataArr = data.slice(0, data.length-1)
                    return dataArr
                }

                // resolve withdrawal factors into arrar
                const resolveWithdrawalFactors =()=>{
                    let factors=[]
                    const minWithdrawalLimit = 5000;
                    const maxWithdrawalLimit = 100000;
                    const withdrawalCommomDiff = 5000;

                    for(let i=minWithdrawalLimit; i<=maxWithdrawalLimit; i=i+withdrawalCommomDiff){
                        factors.push(i)
                    }
                    return factors
                }
                
                // create the default
                const newConfig = new Config({})
                newConfig.withdrawalFactors = resolveWithdrawalFactors()
                newConfig.benefits = resolveArr(benefits)
                newConfig.contacts = resolveArr(contacts)
                newConfig.withdrawalCoins = resolveArr(withdrawalCoins)

                const configs = await newConfig.save()
                return res.status(200).json({ status: true, msg: "success", data: configs})
            }

            // otherwise, get the existing ones
            return res.status(200).json({ status: true, msg: "success", data: config})

        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    updateConfig: async (req, res)=> {
        try{

            const name = 'SmartEarners';
            const bio = 'We Trade it, You Learn & Earn it';
            const benefits = 'benefit1,benefit2,benefit3,'
            const contacts = 'contact1,contact2,contact3,';
            const withdrawalCoins = 'LITECOIN,DOGECOIN,TRON,USDT(bep20),BUSD(bep20),';
            const customerSupport = 'yes';
            const nativeCurrency = 'SEC'
            const tradeCurrency = 'USD';
            const brandColorA = 'rgb(0, 65, 93)';
            const brandColorB = 'rgb(241 173 0)';
            const brandColorC = 'rgb(241 173 0)';
            const aboutUs = 'SmartEarners is a trustworthy platform that has been in existence for years serving several financial institutions across the world. We have had major rights and praises of good reputation amongst the section of investment platforms for trading and circular form of rewards.';
            const verifyEmail = 'no';
            const unverifyUserLifeSpan = 0;
            const conversionRate = 500;
            const investmentLimits = 2;
            const investmentRewardsPercentage = 10;
            const maxWithdrawalLimit = 100000;
            const minWithdrawalLimit = 5000
            const minDepositLimit = 5000
            const withdrawalCommomDiff = 5000
            const masterPlanAmountLimit = 200000
            
            const data = {
                name: req.body.name ? DOMPurify.sanitize(req.body.name) : process.env.COMPANY_NAME ? process.env.COMPANY_NAME : name,
                bio: req.body.bio ? DOMPurify.sanitize(req.body.bio) : process.env.BIO ? process.env.BIO : bio,
                benefits: req.body.benefits ? DOMPurify.sanitize(req.body.benefits) : process.env.BENEFITS ? process.env.BENEFITS : benefits,
                contacts: req.body.contacts ? DOMPurify.sanitize(req.body.contacts) : process.env.CONTACTS ? process.env.CONTACTS : contacts,
                withdrawalCoins: req.body.withdrawalCoins ? DOMPurify.sanitize(req.body.withdrawalCoins) : process.env.WITHDRAWAL_COINS ? process.env.WITHDRAWAL_COINS : withdrawalCoins,
                customerSupport: req.body.customerSupport ? DOMPurify.sanitize(req.body.customerSupport) : process.env.CUSTOMER_SUPPORT ? process.env.CUSTOMER_SUPPORT : customerSupport,
                nativeCurrency: req.body.nativeCurrency ? (DOMPurify.sanitize(req.body.nativeCurrency)).toUpperCase() : process.env.NATIVE_CURRENCY ? (process.env.NATIVE_CURRENCY).toUpperCase() : (nativeCurrency).toUpperCase(),
                tradeCurrency: req.body.tradeCurrency ? (DOMPurify.sanitize(req.body.tradeCurrency)).toUpperCase() : process.env.TRADE_CURRENCY ?  (process.env.TRADE_CURRENCY).toUpperCase() : (tradeCurrency).toUpperCase(),
                brandColorA: req.body.brandColorA ? DOMPurify.sanitize(req.body.brandColorA) : process.env.BRAND_COLOR_A ? process.env.BRAND_COLOR_A : brandColorA,
                brandColorB: req.body.brandColorB ? DOMPurify.sanitize(req.body.brandColorB) : process.env.BRAND_COLOR_B ? process.env.BRAND_COLOR_B : brandColorB,
                brandColorC: req.body.brandColorB ? DOMPurify.sanitize(req.body.brandColorC) : process.env.BRAND_COLOR_C ? process.env.BRAND_COLOR_C : brandColorC,
                aboutUs: req.body.aboutUs ? DOMPurify.sanitize(req.body.aboutUs) : process.env.ABOUT_US ? process.env.ABOUT_US : aboutUs,
                verifyEmail: req.body.verifyEmail ? (DOMPurify.sanitize(req.body.verifyEmail).toLowerCase() === 'yes' ? 'yse' : 'no' )  :  (process.env.VERIFY_EMAIL ? process.env.VERIFY_EMAIL.toLowerCase() === 'yes' ? 'yes' : 'no' : verifyEmail.toLowerCase()),

                unverifyUserLifeSpan: req.body.unverifyUserLifeSpan ? Number(DOMPurify.sanitize(req.body.unverifyUserLifeSpan)) : process.env.UNVERIFIED_USER_LIFESPAN ? Number(process.env.UNVERIFIED_USER_LIFESPAN) : Number(unverifyUserLifeSpan),
                conversionRate: req.body.conversionRate ? Number(DOMPurify.sanitize(req.body.conversionRate)) : process.env.CONVERSION_RATE ? Number(process.env.CONVERSION_RATE) : Number(conversionRate),
                investmentLimits: req.body.investmentLimits ? Number(DOMPurify.sanitize(req.body.investmentLimits)) : process.env.INVESTMENT_LIMITS ? Number(process.env.INVESTMENT_LIMITS) : investmentLimits,

                masterPlanAmountLimit: req.body.masterPlanAmountLimit ? Number(DOMPurify.sanitize(req.body.masterPlanAmountLimit)) : process.env.MASTER_PLAN_AMOUNT_LIMIT ? Number(process.env.MASTER_PLAN_AMOUNT_LIMIT) : masterPlanAmountLimit,

                investmentRewardsPercentage: req.body.investmentRewardsPercentage ? Number(DOMPurify.sanitize(req.body.investmentRewardsPercentage)) : process.env.INVESTMENT_REWARDS_PERCENTAGE ? Number(process.env.INVESTMENT_REWARDS_PERCENTAGE) : Number(investmentRewardsPercentage),
                maxWithdrawalLimit: req.body.maxWithdrawalLimit ? Number(DOMPurify.sanitize(req.body.maxWithdrawalLimit)) : process.env.MAX_WITHDRAWAL_LIMIT ? Number(process.env.MAX_WITHDRAWAL_LIMIT) : Number(maxWithdrawalLimit),
                minWithdrawalLimit: req.body.minWithdrawalLimit ? Number(DOMPurify.sanitize(req.body.minWithdrawalLimit)) : process.env.MIN_WITHDRAWAL_LIMIT ? Number(process.env.MIN_WITHDRAWAL_LIMIT) : Number(minWithdrawalLimit),
                minDepositLimit: req.body.minDepositLimit ? Number(DOMPurify.sanitize(req.body.minDepositLimit)) : process.env.MIN_DEPOSIT_LIMIT ? Number(process.env.MIN_DEPOSIT_LIMIT) : Number(minDepositLimit),
                withdrawalCommomDiff: req.body.withdrawalCommomDiff ? Number(DOMPurify.sanitize(req.body.withdrawalCommomDiff)) : process.env.WITHDRAWAL_COMMON_DIFF ? Number(process.env.WITHDRAWAL_COMMON_DIFF) : Number(withdrawalCommomDiff),
            }

            const resolveArr =(string)=>{
                const data = string.split(',')
                const dataArr = data.slice(0, data.length-1)
                return dataArr
            }

            const resolveWithdrawalFactors =()=>{
                let factors=[]
                const minWithdrawalLimit = data.minWithdrawalLimit
                const maxWithdrawalLimit = data.maxWithdrawalLimit
                const withdrawalCommomDiff = data.withdrawalCommomDiff

                for(let i=minWithdrawalLimit; i<=maxWithdrawalLimit; i=i+withdrawalCommomDiff){
                    factors.push(i)
                }
                return factors
            }

            const modifiedData = {
                name: data.name,
                bio: data.bio,
                benefits: resolveArr(data.benefits),
                contacts: resolveArr(data.contacts),
                withdrawalCoins: resolveArr(data.withdrawalCoins),
                customerSupport: data.customerSupport,
                nativeCurrency: data.nativeCurrency,
                tradeCurrency: data.tradeCurrency,
                brandColorA: data.brandColorA,
                brandColorB: data.brandColorB,
                brandColorC: data.brandColorC,
                aboutUs: data.aboutUs,
                verifyEmail: data.verifyEmail,

                unverifyUserLifeSpan: data.unverifyUserLifeSpan,
                conversionRate: data.conversionRate,
                investmentLimits: data.investmentLimits,
                investmentRewardsPercentage: data.investmentRewardsPercentage,
                masterPlanAmountLimit: data.masterPlanAmountLimit,
                minDepositLimit: data.minDepositLimit,
                minWithdrawalLimit: data.minWithdrawalLimit,
                maxWithdrawalLimit: data.maxWithdrawalLimit,
                withdrawalCommomDiff: data.withdrawalCommomDiff,
                withdrawalFactors: resolveWithdrawalFactors()
            }

            // get all config
            const config = await Config.find({});

            // check if document  is empty
            if(config.length < 1){

                // create the default
                const benefits_ = 'benefit1,benefit2,benefit3,'
                const contacts_ = 'contact1,contact2,contact3,';
                const withdrawalCoins_ = 'LITECOIN,DOGECOIN,TRON,USDT(bep20),BUSD(bep20),';

                const benefits = process.env.BENEFITS ? process.env.BENEFITS : benefits_;
                const contacts = process.env.CONTACTS ? process.env.CONTACTS : contacts_;
                const withdrawalCoins = process.env.WITHDRAWAL_COINS ? process.env.WITHDRAWAL_COINS : withdrawalCoins_;

                // convert benefits and contacts into array
                const resolveArr =(string)=>{
                    const data = string.split(',')
                    const dataArr = data.slice(0, data.length-1)
                    return dataArr
                }

                // resolve withdrawal factors into arrar
                const resolveWithdrawalFactors =()=>{
                    let factors=[]
                    const minWithdrawalLimit = 5000;
                    const maxWithdrawalLimit = 100000;
                    const withdrawalCommomDiff = 5000;

                    for(let i=minWithdrawalLimit; i<=maxWithdrawalLimit; i=i+withdrawalCommomDiff){
                        factors.push(i)
                    }
                    return factors
                }
                
                // create the default
                const newConfig = new Config({})
                newConfig.withdrawalFactors = resolveWithdrawalFactors()
                newConfig.benefits = resolveArr(benefits)
                newConfig.contacts = resolveArr(contacts)
                newConfig.withdrawalCoins = resolveArr(withdrawalCoins)

                const configs = await newConfig.save()
                return res.status(200).json({ status: true, msg: "success", data: configs})
            }

            //get the first and only id
            const id = config[0].id

            //update config
            const configs = await Config.findByIdAndUpdate({_id: id}, {$set: modifiedData }, {new: true});

            return res.status(200).json({ status: true, msg: "Config updated", data: configs})
        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    updateLogo: async (req, res)=> {
        try{
           
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },

    removeLogo: async (req, res)=> {
        try{
           
        }
        catch(err){
            return res.status(500).json({ status: false, msg: "Server error, please contact customer service"})
        }
    },
}