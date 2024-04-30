const Coupon = require('../models/couponModel');

const coupon = async (req, res) => {
    const error = req.flash('error')[0];
    const coupon = await Coupon.find()
    console.log("coupon", coupon);
    res.render('admin/coupon', { error, coupon })
}

const renderAddCoupon = async (req, res) => {
    const error = req.flash('error')[0];

    res.render('admin/addCoupon', { error })
}

const addCoupon = async (req, res) => {
    console.log("req.body", req.body);
    const coupon = await Coupon.create({ ...req.body })
    console.log("coupon", coupon);
    res.send("ok")
}
const deleteCoupon = async (req, res) => {

}

const editCoupon = async (req, res) => {

}
module.exports = { renderAddCoupon, addCoupon, coupon, deleteCoupon, editCoupon }