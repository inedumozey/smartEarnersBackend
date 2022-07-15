const Email = require('@mozeyinedu/email');

const email = new Email({
    host: 'smtp-mail.outlook.com',
    user: '',
    pass: '',
})

email.send({
    from: 'indeumozey@gmail.com',
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