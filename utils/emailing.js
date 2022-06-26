const nodemailer = require('nodemailer');

const emailing= {
    sendMails: (options, cb)=>{
        try{
            if(!options.user){
                throw Error("user is required!")
    
            }if(!options.pass){
                throw Error("pass is required!")
    
            }       
            if(!options.receiver){
                throw Error("receiver email is required!")
    
            }
            else{
                
                const transporter = nodemailer.createTransport({
                    host: 'smtp.gmail.com',
                    service: 'gmail',
                    port: '465',
                    auth: {
                        user: options.user,
                        pass: options.pass
                    }
                });
                
                const name = options.name || 'on-reply'
                const sender = options.sender || ''
                const subject = options.subject || ''
                const html = options.html || ''
                const feedback = options.feedback || `Email has been successfully sent to ${options.receiver}`
                
                const mailOptions = {
                    from: `${name} <${sender}>`,
                    to: options.receiver,
                    subject,
                    html
                }
                
                transporter.sendMail(mailOptions, (err, resp)=>{
                    try{
                        if(err){
                            throw Error(err)
                        }else{
                            cb(null, feedback);
                        }
                    }catch(err){
                        cb(err, null);
                    }
                })
            }
        }
        catch(err){
            cb(err, null)
        }
    }
}


module.exports = emailing;

