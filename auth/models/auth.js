const mongoose = require('mongoose');
const { Schema } = mongoose
const objectID = Schema.Types.ObjectId

const schema = new mongoose.Schema(
    {
        username: {
            type: String,
            unique: true
        },
        email: {
            type: String,
            trim: true,
            unique: true
        },
        password: {
            type: String,
            require: true,
            trim: true
        },
        avater:{
            type: String
        },
        phone:{
            type: String
        },
        amount: {
            type: String,
            default: '0'
        },
        currency: {
            type: String,
            default: 'SEC'
        },
        accountNumber: {
            type: String
        },
        isAdmin: {
            type: Boolean,
            default: false
        },
        token: {
            type: String,
        },
        isVerified: {
            type: Boolean,
            default: false
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        referralCode: {
            type: String,
            require: true,
        },
        referree: [ {
            users: { 
                type: objectID,
                ref: 'User'
            }
        } ],
    },
    {
        timestamps: true
    }
)
mongoose.model("User", schema);