"use strict"

const createError = require("http-errors")
const express = require("express")
const path = require("path")
const bodyParser = require("body-parser")
const cors = require("cors")
const morgan = require("morgan")
const winston = require("./config/winstonConfig")
const db = require('./config/db')

const app = express();

//database
db()

app.use(express.json());

// parse requests of content-type: application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: false}));

// Parse cookie in app
app.use(require('cookie-parser')(process.env.COOKIE_SECRET));
// app.use(require('express-session')());

//parse a request of content type: application/json
app.use(bodyParser.json());

app.use(morgan('combined', { stream: winston.stream }));

var corsOptions = {origin: process.env.LOCALHOST};
app.use(cors(corsOptions))


app.use('/api/user',  require("./routes/user"));
app.use('/api/adminuser',  require("./routes/adminUser"));
app.use('/api/admin',  require("./routes/admin")); 

app.use(function(req, res, next){
    next(createError(404));
});

app.use(function(err, req, res, next){
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};
    winston.error(`${err.status || 500} - ${err.message} - ${req.originalUrl} - ${req.method} - ${req.ip}`);
    res.status(err.status || 500)
    
});


module.exports = app;
