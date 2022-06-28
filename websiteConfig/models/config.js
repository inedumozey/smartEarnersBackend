const mongoose = require('mongoose');
const {ObjectId} = mongoose.Schema.Types

const schema = new mongoose.Schema(
    {
        userId: {
            type: ObjectId,
            ref: 'User'
        },
        name: {
            type: String,
            default: 'SmartEarners'
        },
        logo: {
            type: String,
        },
        bio: {
            type: String,
            default: 'We Trade it, You Learn & Earn it'
        },
        aboutUs: {
            type: String,
            default: 'SmartEarners is a trustworthy platform that has been in existence for years serving several financial institutions across the world. We have had major rights and praises of good reputation amongst the section of investment platforms for trading and circular form of rewards.'
        },
        stands: [],
        customerSupport:{
            type: String,
            default: 'yes'
        },
        unverifyUserLifeSpan:{
            type: String,
            default: 0 // stays forever
        },
        conversionRate: {
            type: String,
            default: "500" // 1 USD === 500 SEC
        },
        nativeCurrency: {
            type: String,
            default: "SEC"
        },
        tradeCurrency: {
            type: String,
            default: "USD"
        },
        brandColorA: {
            type: String,
            default: "rgb(0, 65, 93)"
        },
        brandColorB: {
            type: String,
            default: "rgb(241 173 0)"
        },
        brandColorC: {
            type: String,
            default: "rgb(241 173 0)" // change this color later
        },
        verifyEmail: {
            type: String,
            default: 'no'
        },
        contacts: [],
        investmentCount: {
            type: Number,
            default: 2
        }
    },
    {
        timestamps: true
    }
)
mongoose.model("Config", schema);