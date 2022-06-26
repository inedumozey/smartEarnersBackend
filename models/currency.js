const mongoose = require("mongoose")

const { Schema } = mongoose
const objectID = Schema.Types.ObjectId


module.exports = mongoose.model("Currency", new Schema({
    name: { type: String, default: "SEC", required: true },
    time: { type: Date, default: Date.now()}
}, {timestamp: true}) );