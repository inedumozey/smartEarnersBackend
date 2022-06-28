const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User'
        },
        senderId: {
            type: ObjectId,
            ref: 'User'
        },
        amount: {
            type: Number,
            default: 0
        },
        currency: {
            type: String,
            default: 'SEC'
        },
        receiverId: {
            type: ObjectId,
            ref: 'User'
        },
        accountNumber: {
            type: String
        }

    },
    {
        timestamps: true
    }
)
mongoose.model("InternalTransfer", schema);