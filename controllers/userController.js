const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const sendmail = require('../utils/mailer');
const generateOtp = require('../utils/generateOtp');
const { render } = require('ejs');

let homepage = async function (req, res, next) {
    const userId = req.session.user.user._id;
    console.log("req.session.user", req.session.user.user)
    console.log("userId", userId)
    const user = await User.findOne({ _id: userId });
    // console.log("user", user)
    res.render('user/home', { title: 'Express', user });
    console.log("user===", user)

}


let renderSignup = async (req, res) => {
    try {
        const err = req.flash('error')[0]
        if (!req.session.user) {
            res.render('user/signup', { error: err })
        } else {
            res.redirect('user/home')
        }
    } catch (err) {
        console.error(err);
    }
}

let doSignup = async (req, res) => {
    const { name, email, pass, phone } = req.body
    const isExist = await User.findOne({ email: email })
    // console.log('is exist : ', isExist)
    if (isExist == null) {
        let user = new User();
        user.email = email
        user.password = await bcrypt.hash(pass, 10);
        user.name = name
        user.phone = phone
        const newUser = await user.save();
        req.session.user = newUser;
        console.log("new user:", newUser)
        if (newUser) {
            res.redirect('/verify-user')
        }
    }
    else {
        console.log('flash triggered')
        req.flash('error', 'Email already exist!')
        res.redirect('/signup')

    }
}

let renderOtp = async (req, res) => {
    try {
        const err = req.flash('error')[0]
        const otp = await generateOtp.generateOTP();
        req.session.user.otp = otp;
        console.log(req.session.user)
        const { email } = req.session.user;
        console.log("email:", email);
        await sendmail.sendMail(email, String(otp), "OTP");
        res.render('user/otp', { error: err })
    } catch (error) {
        console.log(error)
    }
}

/**
 * @param {express.Request} req
 * @param {express.Response} res
 */
let verifyUser = async (req, res) => {
    try {
        const { otp } = req.body
        if (req.session.user && otp === req.session.user.otp) {
            const filter = { email: req.session.user.email }
            const update = { is_verified: true }
            await User.findOneAndUpdate(filter, update)
            req.session.user = null;
            res.redirect('/login')
        } else {
            res.status(400).json({ error: 'Enter a valid OTP!' })
        }
    } catch (error) {
        res.status(500).json({ error: 'Enter a valid OTP!' })
    }
}

let renderLogin = async (req, res) => {
    const err = req.flash('error')[0]
    console.log(req.session.user)
    if (req.session.user) res.redirect('/')
    res.render('user/login', { error: err })
}


// res.render('user/login')
let doLogin = async (req, res, next) => {
    const { email, pass } = req.body;
    const isExist = await User.findOne({ email: email })
    if (isExist == null) {
        // console.log("is exist", isExist)
        req.flash('error', 'email is not registered');
        res.redirect('/login')
    }
    else {
        const isPasswordMatch = await bcrypt.compare(pass, isExist.password)
        if (isPasswordMatch) {
            delete isExist.password;
            req.session.user = { user: isExist, isLoggedin: true }
            console.log("is exist", isExist)
            res.redirect('/');
        } else {
            req.flash('error', 'Wrong password')
            res.redirect('/login')
        }
    }
}

// const sendMail = async (req, res) => {
//     try {
//         const otp = await generateOtp.generateOTP();
//         await sendmail.sendMail("hasnabacker25@gmail.com", String(otp), "OTP")
//         res.send("done")
//     } catch (error) {
//         console.log(error)
//     }
// };





//logout
const logout = (req, res) => {
    req.session.destroy()
    res.redirect('/login')
}
module.exports = { homepage, renderSignup, doSignup, logout, renderLogin, doLogin, renderOtp, verifyUser }