const mongoose = require("mongoose")

const { Schema } = mongoose
const objectID = Schema.Types.ObjectId

module.exports = mongoose.model("Transaction", new mongoose.Schema({
    type: { type: String, required: true },
    detail: {
        amount: { type: Number, default: 0, required: true },
        currency: { type: objectID, ref: "Currency", default: "SEC" },
        user: { type: objectID, ref: "User"},
    },
    status: { type: String, enum: [ "SUCCESS", "FAILED"], default: "FAILED" },
    time: { type: Date, default: Date.now()}
}, {timestamp: true}) );