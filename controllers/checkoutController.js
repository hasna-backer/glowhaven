const Address = require('../models/addressModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const { getTotal } = require('../utils/helper');
const { coupon } = require('./couponController');

let renderCheckout = async (req, res) => {
    const user = await User.findOne({ email: req.session.user.user.email }).populate(["cart.product_id", "default_address"]);
    // console.log("userrrr:", user.cart);
    const addresses = await Address.find({ customer_id: req.session.user.user._id })
    // console.log("address", addresses);
    if (!user.default_address) {
        user.default_address = addresses[0]
    }
    const afterdiscount = req.session.totalAmount
    // console.log("after:", afterdiscount);
    if (addresses.length > 0) {
        if (!req.session.coupon?.couponId) {
            let { totalPrice, shipping, totalMrp } = await getTotal(user)
            const { saveOnMrp, subtotal } = req.session.totals
            // console.log("tttttt", totalPrice);
            // const discount = "No Coupon Applied"
            res.render('user/checkout', { user, cartItems: user.cart, totalPrice, totalMrp, saveOnMrp, subtotal, discount: "", addresses, shipping, coupon: {} })

        }
        else {
            let { shipping, totalMrp } = await getTotal(user)
            let { total_payable, couponId, discountAmount } = req.session.coupon

            // console.log("t,c,disc:", total_payable, couponId, discountAmount);
            const coupon = await Coupon.findOne({ _id: req.session.coupon.couponId })
            // console.log("logsss:", totalPrice, coupon, shipping);
            const { saveOnMrp, subtotal } = req.session.totals
            res.render('user/checkout', { user, cartItems: user.cart, totalPrice: Math.round(total_payable), discount: Math.round(discountAmount), totalMrp, saveOnMrp, addresses, shipping, coupon, subtotal })
        }
    }
    else {

        res.redirect('/add-address')
    }
}

let newAddress = async (req, res) => {

    const user = req.session.user.user.email

    res.render('user/address', { user })
}




let submitAddress = async (req, res) => {
    const userId = req.session.user.user._id

    let address = await Address.create({ ...req.body, customer_id: userId })
    // console.log(address);
    // console.log("address", req.body);
    res.redirect('/checkout')

}

const chooseAddress = async (req, res) => {
    userId = req.session.user.user._id
    const { id } = req.body
    // console.log("choose addrss", id);
    const default_adress = await User.updateOne({ _id: userId }, { default_address: id })
    // console.log("default address", default_adress)
    return res.status(200).json({ message: "product added  succesful" })

}

const removeAddress = async (req, res) => {
    const user = await User.findOne({ _id: req.session.user.user._id }).populate("cart.product_id")
    // console.log("removeuser", user);
    const { id } = req.params
    const deletedAddress = await Address.findOneAndDelete({ _id: id });
    return res.status(200).json({ message: "product deleted  succesful" })


}

const renderPayment = async (req, res) => {
    const user = await User.findOne({ email: req.session.user.user.email }).populate(["cart.product_id", "default_address"]);
    const addresses = await Address.find({ customer_id: req.session.user.user._id })
    let totalAmountToPay

    if (addresses.length > 0) {

        const { totalPrice, shipping } = await getTotal(user)
        const amount_payable = totalPrice + shipping
        if (!req.session.coupon?.couponId) {
            totalAmountToPay = amount_payable
        } else {
            totalAmountToPay = Math.round(req.session.coupon.total_payable)
        }

        res.render('user/payment', { totalAmountToPay, user })
    }
}



module.exports = {
    newAddress,
    renderCheckout,
    submitAddress,
    chooseAddress,
    removeAddress,
    renderPayment
}





