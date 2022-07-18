const Email = require('@mozeyinedu/email');
require('dotenv').config()

const email = new Email({
    host: process.env.HOST,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
})

email.send({
    from: process.env.EMAIL_USER,
    to: 'indeumozey@gmail.com',
    subject: 'Test',
    html: `<h1>testing smtp</h1>`,
}, 

(err, res)=>{
    if(err){
        console.log(err)
    }
    else{
        console.log(res)
    }
});