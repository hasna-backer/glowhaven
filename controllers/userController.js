const { render } = require('ejs');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const sendmail = require('../utils/mailer');
const generateOtp = require('../utils/generateOtp');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Address = require('../models/addressModel');
const Category = require('../models/categoryModel');
const validate = require('../validations/signupValidation');
const { response } = require('express');
const { Express } = require('express');
const productModel = require('../models/productModel');

let homepage = async function (req, res, next) {
    const product = await Product.find({ status: { $ne: false }, delete: { $ne: true } });
    let categoryId = product.category_id
    const category = await Category.findOne({ _id: categoryId })

    let updatedProducts = await Promise.all(product.map(async e => {
        let categoryId = e.category_id
        const category = await Category.findOne({ _id: categoryId })
        if (!category.discount) {
            const product = e.toObject()
            product.selling_price = Math.round(product.actual_price - ((product.discount / 100) * product.actual_price))
            console.log("a", product.selling_price);
            return product
        } else {
            const product = e.toObject()
            product.selling_price = Math.round(product.actual_price - ((category.discount / 100) * product.actual_price))
            console.log("b", product);
            return product
        }
    }))
    const userId = req.session.user.user._id;
    console.log("userId", userId)
    const user = await User.findOne({ _id: userId });
    // console.log("user", user)
    res.render('user/home', { title: 'Express', user, products: updatedProducts });
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
    console.log("hi");
    const { search } = req.query
    try {
        if (!search) {
            const products = await Product.find({ status: { $ne: false }, delete: { $ne: true } });
            console.log("productssssss", products);
            //stock mngt
            if (products.stock === 0) {

            }
            //calculating discount
            let categoryId = products.category_id
            const category = await Category.findOne({ _id: categoryId })

            let updatedProducts = await Promise.all(products.map(async e => {
                let categoryId = e.category_id
                const category = await Category.findOne({ _id: categoryId })
                if (!category.discount) {
                    const product = e.toObject()
                    product.selling_price = Math.round(product.actual_price - ((product.discount / 100) * product.actual_price))
                    console.log("a", product.selling_price);
                    return product
                } else {
                    const product = e.toObject()
                    product.selling_price = Math.round(product.actual_price - ((category.discount / 100) * product.actual_price))
                    console.log("b", product);
                    return product
                }
            }))
            console.log("cals", updatedProducts);
            return res.render('user/product', { user: req.session.user, products: updatedProducts });
        }
        const products = await Product.find({
            product_name: { $regex: new RegExp(search, 'i') }
        });
        console.log("products", products);
        console.log("Gfdgfgfsggfgdfgdgfgfgfgfgdfgdfgdfgdfgdfg");
        return res.render('user/product', { products, user: req.session.user });

    } catch (error) {
        console.log(error);
    }

};

const renderSingleProducts = async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category_id");
    console.log("prod", product);
    let categoryId = product.category_id
    const category = await Category.findOne({ _id: categoryId })
    console.log("catg", category);
    if (!category.discount) {
        const discountAmount = ((product.discount / 100) * product.actual_price)
        let sellingPrice = Math.round(product.actual_price - discountAmount)
        res.render('user/singleProduct', { product, user: req.session.user, sellingPrice })

    }
    else {
        const discountAmount = ((category.discount / 100) * product.actual_price)
        let sellingPrice = Math.round(product.actual_price - discountAmount)
        res.render('user/singleProduct', { product, user: req.session.user, sellingPrice })
    }

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