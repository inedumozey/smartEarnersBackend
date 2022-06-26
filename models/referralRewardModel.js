const mongoose = require("mongoose")
const crypto = require("crypto")
const uniqueValidator = require("mongoose-unique-validator")

mongoose.Promise = global.Promise

const { Schema } = mongoose
const objectID = Schema.Types.ObjectId

const RewardSchema = new Schema({
    user: { type: objectID, ref: 'User'},
    referree: [ {
        users: { 
            type: objectID,
            ref: 'User'
        }
    } ],
}, { timestamp: true })

RewardSchema.plugin(uniqueValidator, {message: "Reward has been taken"})


module.exports = mongoose.model("ReferralReward", RewardSchema)

