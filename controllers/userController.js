const { render } = require('ejs');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const sendmail = require('../utils/mailer');
const generateOtp = require('../utils/generateOtp');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const validate = require('../validations/signupValidation');
const { response } = require('express');
const { Express } = require('express');

let homepage = async function (req, res, next) {
    const products = await Product.find({});
    const userId = req.session.user.user._id;
    console.log("userId", userId)
    const user = await User.findOne({ _id: userId });
    // console.log("user", user)
    res.render('user/home', { title: 'Express', user, products });
    console.log("user===", user)

}


let renderSignup = async (req, res) => {
    try {
        const err = req.flash('error')[0]
        if (!req.session.user) {
            res.render('user/signup', { error: err })
        } else {
            res.redirect('/')
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

let doSignup = async (req, res) => {
    const { name, email, pass, phone } = req.body
    console.log(req.body);
    const isExist = await User.findOne({ email: email })
    console.log('is exist : ', isExist)
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
            res.status(200).json({ message: 'signup succes!' })
        }
    }
    else {
        console.log('flash triggered')
        res.status(400).json({ error: 'Email already exist!' })
        // req.flash('error', 'Email already exist!')

    }
}




let renderOtp = async (req, res) => {
    try {

        const err = req.flash('error')[0]
        const otp = await generateOtp.generateOTP();
        const { email } = req.session.user;
        await User.findOneAndUpdate({ email }, { otp })
        console.log("email:", email);
        sendmail.sendMail(email, String(otp), "OTP");
        req.session.destroy();
        res.render('user/otp', { error: err, email })
    } catch (error) {
        console.log(error)
    }
}

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
let verifyUser = async (req, res) => {
    try {
        const { otp, email } = req.body
        const user = await User.findOne({ email })
        if (user && Number(otp) === user.otp) {
            const filter = { email }
            const update = { is_verified: true }
            await User.findOneAndUpdate(filter, update)

            res.redirect('/login')
        } else {
            res.status(400).json({ error: 'Enter a valid OTP!' })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Enter a valid OTP!' })
    }
}


let renderLogin = async (req, res) => {
    if (req.session.user && req.session.user.isLoggedin) {
        console.log("user", req.session.user, req.session.user.isLoggedin)
        return res.redirect('/')
    }
    const err = req.flash('error')[0]

    res.render('user/login', { error: err })
}


// res.render('user/login')
let doLogin = async (req, res, next) => {
    const { email, pass } = req.body;
    const isExist = await User.findOne({ email: email });
    if (!isExist) {
        req.flash('error', 'email is not registered');
        return res.redirect('/login');
    }
    try {
        const isPasswordMatch = await bcrypt.compare(pass, isExist.password);
        if (isPasswordMatch) {
            const { _id, name, email, role } = isExist;
            req.session.user = { user: { _id, name, email, role }, isLoggedin: true };
            return res.redirect('/');
        }
        req.flash('error', 'Wrong password');
        return res.redirect('/login');
    } catch (error) {
        next(error);
    }
};


let renderViewProducts = async (req, res) => {
    const products = await Product.find({});
    res.render('user/product', { products });
};

let renderSingleProducts = async (req, res) => {
    const products = await Product.findById(req.params.id);
    res.render('user/singleProduct', { products })
};


//logout
const logout = (req, res) => {
    req.session.destroy()
    res.redirect('/login')
}
module.exports = { homepage, renderSignup, doSignup, logout, renderLogin, doLogin, renderOtp, verifyUser, renderViewProducts, renderSingleProducts }