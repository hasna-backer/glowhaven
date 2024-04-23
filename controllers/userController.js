const { render } = require('ejs');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const sendmail = require('../utils/mailer');
const generateOtp = require('../utils/generateOtp');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Address = require('../models/addressModel');
const validate = require('../validations/signupValidation');
const { response } = require('express');
const { Express } = require('express');
const productModel = require('../models/productModel');

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

let resendOtp = async (req, res) => {
    try {
        console.log("its working", req.body);
        const err = req.flash('error')[0]
        const otp = await generateOtp.generateOTP();
        const { email } = req.body;
        await User.findOneAndUpdate({ email }, { otp })
        console.log("email:", email);
        sendmail.sendMail(email, String(otp), "OTP");
        req.session.destroy();
        res.render('user/otp', { error: err, email })
    } catch (error) {
        console.log(error)
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
            console.log("dolgin isExist", isExist);
            const { _id, name, email, phone } = isExist;
            req.session.user = { user: { _id, name, email, phone }, isLoggedin: true };
            console.log("sesssiion", req.session);
            return res.redirect('/');
        }
        req.flash('error', 'Wrong password');
        return res.redirect('/login');
    } catch (error) {
        next(error);
    }
};

let viewProfile = async (req, res) => {
    // const { user } = req.session.user
    const address = await Address.find({ customer_id: req.session.user.user._id })
    console.log("address", address);
    const user = await User.findOne({ email: req.session.user.user.email })
    console.log("profile", user);
    // if (req.session.user)
    res.render('user/profile', { user, address })
}

// let renderEditProfile = async (req, res) => {
//     const { user } = req.session.user
//     res.render('user/profileEdit', { user })
// }

let editProfile = async (req, res) => {
    console.log("reqqqqq", req.body)
    try {
        const filter = { email: req.body.email }
        let user = await User.findOneAndUpdate(filter, req.body, { new: true }).select("-password")
        req.session.user.user = user
        // console.log("userrrrrrrrr", user);
        // console.log("session.user", req.session.user);
        // console.log("session.user.user", req.session.user.user);
        res.status(200).json({ message: 'edit Done' })
    } catch (error) {
        res.status(400).json({ message: 'error!!!' })

    }
}


let renderViewProducts = async (req, res) => {
    const { search } = req.query
    try {
        if (!search) {
            const products = await Product.find({});
            return res.render('user/product', { products, user: req.session.user });
        }
        const products = await Product.find({
            product_name: { $regex: new RegExp(search, 'i') }
        });
        console.log("products", products);
        return res.render('user/product', { products, user: req.session.user });

    } catch (error) {
        console.log(error);
    }

};

let renderSingleProducts = async (req, res) => {
    const products = await Product.findById(req.params.id);
    res.render('user/singleProduct', { products, user: req.session.user })
};

//search products
const searchProducts = async (req, res) => {
    console.log("res.query", req.body);
    const searchQuery = req.body.searchInput;

    try {
        const products = await Product.find({
            product_name: { $regex: new RegExp(searchQuery, 'i') }
        });

        console.log("products", products);
        res.json(products);
    } catch (error) {
        console.error("Error searching for products:", error);
        // Send an error response if something went wrong
        res.status(500).json({ error: "Internal server error" });
    }
}

//logout
const logout = (req, res) => {
    req.session.destroy()
    res.redirect('/login')
}
module.exports = {
    homepage,
    renderSignup,
    doSignup,
    logout,
    renderLogin,
    doLogin,
    renderOtp,
    verifyUser,
    resendOtp,
    renderViewProducts,
    renderSingleProducts,
    viewProfile,
    editProfile,
    searchProducts
}