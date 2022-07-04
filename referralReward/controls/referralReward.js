const mongoose = require('mongoose')
const User = mongoose.model("User");
const Config = mongoose.model("Config");
const ReferralReward = mongoose.model("ReferralReward");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;


module.exports ={

    resolve: async (req, res)=> {
        try{
           // get all users
           const users = await User.find({});

           // get investmentRewardsPercentage from config data if exist otherwise set to the one in env
            // get all config
            const config = await Config.find({});

           // loop through users to get their referree
           for(let user of users){

                // get their referree
                const referree = user.referree

                // check if referree exist and their length is more than 0
                if(referree && referree.length > 0){

                    // get the referreeUsers with this referree (referree its an id here)
                    const referreeUsers = await User.find({_id: referree}) 
                    
                    // loop through these referreeUsers
                    for(let referreeUser of referreeUsers){  
                                              
                        // 1. check if the referreeUser have invested and has not returned referral any referral rewards
                        if(referreeUser.hasInvested && referreeUser.firstInvestmentPlanValue && !referreeUser.hasReturnedReferralRewards){
                            
                            const referrerUserIds = referreeUser.referrerId

                            // 2. get the referreeUsers firstInvestmentPlanValue
                            const firstInvestmentPlanValue = Number(referreeUser.firstInvestmentPlanValue)
                            
                            // 3. get investmentRewardsPercentage from config databse
                            const investmentRewardsPercentage = config && config.length >= 1 && config[0].investmentRewardsPercentage? Number(config[0].investmentRewardsPercentage) : Number(process.env.INVESTMENT_REWARDS_PERCENTAGE);

                            // 5. calculate the referalRewards
                            const referralRewards = investmentRewardsPercentage / 100 * firstInvestmentPlanValue

                            // 4. get their referrerUsers
                            const referrerUsers = await User.find({_id: referrerUserIds});
                            for(let referrerUser of referrerUsers){
                                
                                // update their account balance with the referalRewards
                                await User.findOneAndUpdate({_id: referrerUser.id}, {$set: {
                                    amount: referrerUser.amount + referralRewards
                                }})

                                // populate the ReferralReward database
                                const referralReward = new ReferralReward({
                                    referrerId: referrerUser.id,
                                    referreeId: referreeUser,
                                    referralRewards,
                                })
                                await referralReward.save()

                                // update the referreeUser changing hasReturnedReferralRewards to true (So they cannot return referral rewards for more than once to their referrerUsers)
                                await User.updateMany({_id: referree}, {$set: {
                                    hasReturnedReferralRewards: true
                                }});
                            }
                        }
                    }
                }
           }

            return res.status(200).json({ status: true, msg: 'success'});

        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    getAllRewards: async (req, res)=> {
        try{
           

        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    },

    getRewards: async (req, res)=> {
        try{
           

        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    }
}

// "Server error, please contact customer service"