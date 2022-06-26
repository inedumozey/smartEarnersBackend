"use strict"

const express = require("express")
const path = require("path")
const cors = require("cors")
const morgan = require("morgan")
const winston = require("./config/winstonConfig")
const db = require('./config/db')
const cookieParser = require('cookie-parser')

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

// routes
app.use('/auth',  require("./auth/routes/auth")); 


app.use(function(err, req, res, next){
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500)
    
});

// normalize port
const normalizePort = (val) => {
    let port = parseInt(val, 10)
    if(isNaN(port))
        return val
    
    if(port >= 0)
        return port
    
    return false
}

// connect server
const PORT = normalizePort(process.env.PORT || "5000")
const server = app.listen(PORT, ()=>{
    console.log(`Server connected in port ${PORT}`)
})
