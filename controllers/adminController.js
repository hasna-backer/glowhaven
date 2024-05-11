const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const bcrypt = require('bcrypt')


let dashboard = async (req, res) => {
    res.render('admin/dashboard');
}

const renderLogin = async (req, res) => {
    const err = req.flash('error')[0]
    if (req.session.admin && req.session.isLoggedin) {
        res.redirect('/admin')
    }
    else {
        res.render('admin/login', { error: err });
    }
};

const doLogin = async (req, res) => {
    const { email, pass } = req.body;
    console.log("email and pwd", req.body)
    const isExist = await Admin.findOne({ email: email })
    console.log("findoneadmin", isExist)
    if (isExist == null) {
        req.flash('error', 'email is not registered');
        res.redirect('/admin/login')
    }
    else {
        const isPasswordMatch = await bcrypt.compare(pass, isExist.password)
        console.log('isPasswordMatch:', isPasswordMatch);
        if (isPasswordMatch) {
            delete isExist.password;
            req.session.admin = { admin: isExist, isloggedin: true }
            // console.log("session::::", req.session.admin);
            res.redirect('/admin');
            console.log("homepage")
        }
        else {
            req.flash('error', 'wrong password');
            res.redirect('/admin/login')
            console.log("loginpage...wrong password")

        }
    }
}

//sales report
const salesReport = async (req, res) => {
    const order = await Order.find().populate(["items", "customer_id", "items.product_id"])
    // console.log("order123", order[0].items);
    console.log("order111", order);
    // order.forEach(()=>)
    res.render('admin/report')
}

//logout
let logout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
}
module.exports = { dashboard, renderLogin, doLogin, logout, salesReport }