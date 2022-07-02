"use strict"

const express = require("express")
const cors = require("cors")
const morgan = require("morgan")
const cookieParser = require('cookie-parser')
require('dotenv').config()

const winston = require("./config/winstonConfig")
const db = require('./config/db')

const app = express();

//database
db()

// parse requests of json type
app.use(express.json({
    verify: (req, res, buf)=>{
        req.rawBody = buf
    }
}))

// parse requests of content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false}));

// Parse cookie in app
app.use(cookieParser())

// logger
app.use(morgan('combined', { stream: winston.stream }));

// cross-origin request
var corsOptions = {origin: process.env.FRONTEND_BASE_URL};
app.use(cors(corsOptions))

// register database model
require('./auth/models/auth')
require('./auth/models/passwordReset')
require('./websiteConfig/models/config')
require('./internalTransfer/models/internalTransfer')
require('./investment/models/investmentPlan')
require('./investment/models/investment')
require('./referralReward/models/referralReward')
require('./deposit/models/deposit')
require('./withdrawal/models/withdrawal')

// routes
app.use('/auth',  require("./auth/routes/auth")); 
app.use('/config',  require('./websiteConfig/routes/config')); 
app.use('/transfer',  require('./internalTransfer/routes/internalTransfer')); 
app.use('/investment',  require('./investment/routes/investment')); 
app.use('/referralReward',  require('./referralReward/routes/referralReward')); 
app.use(require('./deposit/routes/deposit')); 
app.use('/withdrawal',  require('./withdrawal/routes/withdrawal')); 

app.use(function(err, req, res, next){
    // res.locals.message = err.message;
    // res.locals.error = req.app.get('env') === 'development' ? err : {};
    winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    // res.status(err.status || 500)
});


// normalize port
const normalizePort = (val) => {
    let port = parseInt(val, 10)

    if(isNaN(port)) return val
    
    if(port >= 0) return port
    
    return false
}

// connect server
const PORT = normalizePort(process.env.PORT || "5000")
const server = app.listen(PORT, ()=>{
    console.log(`Server connected in port ${PORT}`)
})


//conversion rate (testing)
const conversionRate = require('./config/conversionRate');

async function run(){
    const usd = await conversionRate.SEC_TO_USD(50)
    console.log(usd)
}

const axios = require('axios')
async function run(){
    try{
        const res = await axios.get(`https://api.coinbase.com/v2/exchange-rates?currency=ltc`);
        const usd = res.data.data.rates.USD * 0.0001
        

    }
    catch(err){
        console.log(err.message)
    }
}

// run()