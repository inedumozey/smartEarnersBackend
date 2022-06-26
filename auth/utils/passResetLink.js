require('dotenv').config();
const Email = require('@mozeyinedu/email')

const PRODUCTION = Boolean(process.env.PRODUCTION);
const createdYear = new Date().getFullYear();
const copyrightYear = createdYear > 2022 ? `2022 - ${new Date().getFullYear()}` : '2022'
const websiteName = process.env.COMPANY_NAME

const email = new Email({
    username:  process.env.EMAIL_USER,
    password: process.env.EMAIL_PASS
});

module.exports = async(data, res)=>{
    
    const URL =  `${process.env.FRONTEND_BASE_URL}/${process.env.FRONTEND_RESET_PASS_URL}/?token=${data.passwordReset.token}`

    if(PRODUCTION){
        // email text
        const text = `
            <div style="border: 2px solid #aaa; box-sizing: border-box; margin: 0; background: #fff; height: 70vh; padding: 10px">

                <div style="text-align:center; height: 70px; background: rgb(0, 65, 93)">
                    <h2 style="font-weight: bold; font-size: 1.5rem; color: #fff; padding:3px 3px 0 3px; margin:0">
                        SmartEarners
                    </h2>
                    <small style="color: #aaa; width: 100%; font-size: 0.8rem; font-style: italic; font-weight: 600;">
                        We Trade it, You Learn & Earn it
                    </small>
                </div>

                <div style="height: calc(100% - 70px - 40px - 20px - 10px - 10px); width:100%">
                    <div style="font-size: 1rem; text-align: center; color:#000; padding: 50px 10px 20px 10px">
                        Please ignore if this is not sent by you!.
                    </div>
                    <div>
                        <a style="display:inline-block; background: rgb(0, 65, 93); text-align:center; padding: 15px; color: #fff; font-weight: 600" href="${URL}">Click to Reset your Password</a>
                    </div>
                    <div style="text-align: center; margin: 5px 0; padding:10px">${URL}</div>
                </div>

                <div style="text-align:center; height: 40px; padding: 10px; background: #000">
                    <div style="color: #fff; padding: 0; margin:0">
                        Copyright @ ${copyrightYear} ${websiteName}
                    <div>
                </div>

            </div>
        `

        const options = {
            name: websiteName,
            receiver: data.email,
            subject: 'Rest Your Password',
            html: text,
        }
        
        email.send(options, async(err, resp)=>{
            if(err){
                if(err.message.includes("ENOTFOUND") || err.message.includes("EREFUSED") || err.message.includes("EHOSTUNREACH")){
                    return res.status(408).json({status: false, msg: "No network connectivity"})
                }
                if(err.message.includes("ETIMEDOUT")){
                    return res.status(408).json({status: false, msg: "Request Time-out! Check your network connections"})
                }
                else{
                    return res.status(400).json({status: false, msg: err.message})
                }
            }
            else{
                return res.status(200).json({status: true, msg: `Check your email (${data.email}) to reset your password`});
            }
        })                    

    }else{

        return res.status(200).json({status: true, msg: "On development mode! Please check below to reset your password", token: data.passwordReset.token});
    }
}