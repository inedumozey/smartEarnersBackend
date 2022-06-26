const mongoose = require('mongoose');

const objectID = Schema.Types.ObjectId

const accountSchema = new mongoose.Schema({
        user: { type: objectID, ref: "User"},
        totalAmount: {type: Number, default: 0 },
        
}, {timestamp: true})

module.exports = mongoose.model("Account", accountSchema );