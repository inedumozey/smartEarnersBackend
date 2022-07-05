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
        amount: {
            type: Number
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("ReferralBonus", schema);