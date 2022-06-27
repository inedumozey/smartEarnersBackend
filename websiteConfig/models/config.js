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
        whatWeDo: {
            type: String,
            default: 'We give you the opportunities to invest & earn more'
        },
        customerSupport:{
            type: String,
            default: 'yes'
        },
        unverifyUserLifeSpan:{
            type: String,
            default: 120 // 2419200 - 28days
        },
        convertionRate: {
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
        majorBrandColor: {
            type: String,
            default: "rgb(0, 65, 93)"
        },
        minorBrandColor: {
            type: String,
            default: "rgb(241 173 0)"
        },
    },
    {
        timestamps: true
    }
)
mongoose.model("Config", schema);