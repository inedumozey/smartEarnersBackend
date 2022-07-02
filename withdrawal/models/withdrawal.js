const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User'
        },
        walletAddress: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            trim: true
        },
        currency: {
            type: String,
            default: 'SEC'
        },
        coin: {
            type: String
        },
        status: {
            type: String,
            default: 'Pending'
        },
        resolved: {
            type: Boolean,
            default: false
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("Withdrawal", schema);