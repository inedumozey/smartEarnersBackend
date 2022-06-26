const mongoose = require("mongoose")

const { Schema } = mongoose
const objectID = Schema.Types.ObjectId

module.exports = mongoose.model("Deposit", new Schema({
    user: { type: objectID, ref: "User"},
    amount: {type: Number, default: 0 },
    currency: { type: objectID, ref: "Currency", required: true},
    time: { type: Date, default: Date.now()}
}, {timestamp: true}));