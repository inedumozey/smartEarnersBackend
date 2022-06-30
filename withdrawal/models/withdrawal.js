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
        amountRequested: {
            type: Number,
            trim: true
        },
        amountPaid: {
            type: Number,
            trim: true
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