require('dotenv').config()

function setCookie(accesstoken, refreshtoken, res){

    res.cookie("accesstoken", accesstoken, {
        httpOnly: false,
        maxAge: Number(process.env.COOKIE_ACCESSTOKEN_DURATION),
        secure: false
    });

    res.cookie("refreshtoken", refreshtoken, {
        httpOnly: false,
        maxAge: Number(process.env.COOKIE_REFRESHTOKEN_DURATION),
        secure: false
    });
}

module.exports = setCookie