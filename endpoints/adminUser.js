const mongoose = require('mongoose')
const User = require('../models/user')

require("dotenv").config();


module.exports ={

    // Retrive all users
    getAllUsers: async (req, res)=> {
        try{
           const users = await User.find();
           res.status(200).json({ status: true, msg: "successfull", users})
        }
        catch(err){
            res.status(500).json({ status: false, msg: "Error occured while trying to retrieve all users"})
        }
    },

    // Retrive user
    getUser: async (req, res)=> {
       try{
        const {id } = req.params;

        const user = await User.find({_id: id});
        if(!user)
            res.status(404).json({status: false, msg: `User not found!`});
        res.status(200).json({status: true, msg: 'successfull', user});
       }

       catch(err){
            res.status(500).send({ status: false, msg: error.message || `Error occured while retrieving user with email: ${req.params.email} `})
       }
    }


}

