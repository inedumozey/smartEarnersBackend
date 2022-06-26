const mongoose = require('mongoose')
// const User = mongoose.model('User');
const User = require('../models/user')

require("dotenv").config();


module.exports ={

     // Delete User by ID
     deleteUserByIdOrEmail: async (req, res)=> {
        try{
            let id = req.body.id
        
        const user = await User.findByIdAndRemove({$or: [{_id: id}, {email: id}]})
        if(!user){
            return res.status(404).send({status: false, msg: `Can not delete User with ${id}. Perhaps User is not found`})
        }
        return res.status(200).json({status: true, msg: "User was Deleted successfully"})
        }
        catch(err){
            res.status(500).json({status: false, msg: err.message || `Server error contact admin`})
        }
    },

    // Delete All Users
    deleteAllUsers: async (req, res)=> {
        try{
            await User.deleteMany()
            return res.status(200).json({status: true, msg: "All users were Deleted successfully"})
        }
        catch(err){
            res.status(500).json({status: false, msg: err.message || `Server error contact admin`})
        }
    },

}

