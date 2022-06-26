const mongoose = require('mongoose');

const objectID = Schema.Types.ObjectId

const investmentSchema = new mongoose.Schema({
    user: { type: objectID, ref: "User"},
    plans: { type: String },
    amount: { type: Number, default: 0 },
    reward: {type: Number, default: 0 }
}, {timestamp: true})



module.exports = mongoose.model("Investment", investmentSchema);