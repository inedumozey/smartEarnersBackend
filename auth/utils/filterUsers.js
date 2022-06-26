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
    }
}