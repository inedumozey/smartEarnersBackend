const mongoose = require('mongoose')
const MOGOURL = process.env.MONGOOSE_UR || `mongodb://localhost:27017/smartEarners`

module.exports = async() =>{
    try{
        mongoose.connect(MOGOURL);
        console.log("Database connected")
    }
    catch(err){
        console.log("Database connection error");
    }
}