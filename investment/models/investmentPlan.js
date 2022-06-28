const mongoose = require('mongoose');

const schema = new mongoose.Schema(
    {
        type: {
            type: String,
            required: true,
            trim: true
        },
        amount: {
            type: Number,
            default: 0,
            required: true,
            trim: true
        },
        currency: {
            type: String,
            default: 'SEC',
            trim: true
        },
        lifespan: {
            type: String,
            trim: true // in seconds
        },
        returnPercentage: {
            type: String,
            required: true,
            trim: true
        },
    },
    {
        timestamps: true
    }
)
mongoose.model("InvestmentPlan", schema);