const mongoose = require('mongoose')
const User = mongoose.model('User');

module.exports = {

    removeUnVerifiedUsers: async(time)=>{
        const users = await User.find()
        const expiresIn = parseInt(time);
        const currentTime = new Date().getTime() / 1000 / 60

        for(let user of users){
            const createdTime = new Date(user.createdAt).getTime() / 1000 / 60;

            if(!user.isVerified && currentTime - createdTime >= expiresIn){
                const users = await User.deleteMany({isVerified: false})
            }
        }
    },

    deactivateUser: async (id)=>{
        // Find and Deactivate user with his/her email or id
        const user = await User.findOneAndUpdate({$or : [{email:id}, {_id: id}]}, 
            {
                $set: {
                    isActivated: false
                }
            }, 
            { new: true})
        },
   

    activateUser: async(id)=> {
        // Find and Activate user with his/her email or id
        const user = await User.findOneAndUpdate({$or : [{email:id}, {_id: id}]}, 
            {
                $set: {
                    isActivated: true
                }
            }, { new: true})
    }
}