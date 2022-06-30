const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        referrerId: {
            type: ObjectId,
            ref: 'User'
        },
        referreeId: {
            type: ObjectId,
            ref: 'User'
        },
        referralRewards: {
            type: Number
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("ReferralReward", schema);