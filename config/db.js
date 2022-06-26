const mongoose = require('mongoose')

const dbURLs = {
    development: { connectionString: process.env.MONGOOSE_URL},
    production: { connectionString: process.env.DB_URI_PRO}
}

module.exports = () =>{
    try{
        mongoose.connect(dbURLs.development.connectionString);
        console.log("Database connected")
    }
    catch(err){
        console.log("Database connection error");
    }
}