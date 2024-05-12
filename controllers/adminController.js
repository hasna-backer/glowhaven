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
    console.log("hiiii");
    const today = new Date()
    const prevdate = today.setDate(today.getDate() - 30)
    console.log("date", prevdate);
    let startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(prevdate);
    let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    console.log("dates", startDate, endDate);

    const orders = await Order.find().populate({ path: "customer_id", select: "name" })
    // console.log("order123", order[0].items);
    // console.log("order111", orders);
    // orders.forEach((order) => {
    //     console.log(order.customer_id.name);
    // })
    const details = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $nin: ["Cancelled", "Failed"] },
            },
        },
        {
            $lookup: {
                from: "users",
                localField: "customer_id",
                foreignField: "_id",
                as: "customer"
            }
        },
        { $unwind: "$customer" },
        {
            $lookup: {
                from: "products",
                localField: "items.product_id",
                foreignField: "_id",
                as: "products"
            }
        },
        { $unwind: "$products" },
        {
            $lookup: {
                from: "categories",
                localField: "products.category_id",
                foreignField: "_id",
                as: "category"
            }
        },
        { $unwind: "$category" },
        {
            $project: {
                "address": 1,
                "total_amount": 1,
                "payment_method": 1,
                "coupon": 1,
                "status": 1,
                "createdAt": 1,
                "name": "$customer.name",
                "product_name": "$products.product_name",
                // "products": 1,  
                "category_discount": "$category.discount"
            }
        },

    ])
    details.forEach((order) => {
        console.log("coupon", order.coupon);
    })
    console.log("details", details);
    res.render('admin/report', { details, startDate, endDate })
}

// generate Pdf
const getSalesReportPdf = async (req, res) => {

}




//logout
let logout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
}
module.exports = { dashboard, renderLogin, doLogin, logout, salesReport, getSalesReportPdf }