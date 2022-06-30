const mongoose = require('mongoose')
const Deposit = mongoose.model("Deposit");
const User = mongoose.model("User");
const Config = mongoose.model("Config");
require("dotenv").config();
const createDOMPurify = require('dompurify');
const {JSDOM} = require('jsdom');

const window = new JSDOM('').window;
const DOMPurify = createDOMPurify(window)


module.exports ={
    
    pend: async (req, res)=> {
        try{
            

        }
        catch(err){
            return res.status(500).json({ status: false, msg: err.message})
        }
    }
}