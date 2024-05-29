const Coupon = require('../models/couponModel');
const Order = require('../models/orderModel');
const User = require('../models/userModel');
const { getTotal } = require('../utils/helper')

//admin
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

//admin
const addCoupon = async (req, res) => {
    console.log("req.body", req.body);
    const coupon = await Coupon.create({ ...req.body })
    console.log("coupon", coupon);
    req.flash('error', 'Coupon added successfully!');
    res.redirect('/admin/coupon')
    // res.send("ok")

}
//admin
const deleteCoupon = async (req, res) => {

}

//admin
const renderEditCoupon = async (req, res) => {
    try {
        const error = req.flash('error')[0];
        // console.log("req.params.id", req.params.id);
        const coupon = await Coupon.findById(req.params.id)
        // console.log(coupon);
        res.render('admin/editCoupon', { error, coupon })
    } catch (error) {
        // console.log(error);
    }
}
//admin
const editCoupon = async (req, res) => {
    try {
        // console.log("req", req.body);
        couponId = req.body.couponId
        const coupon = await Coupon.updateOne({ _id: couponId }, req.body)
        const cp = await Coupon.findOne({ _id: couponId })
        // console.log("cp:", cp);
        req.flash('error', 'Coupon edited successfully!');
        return res.status(200).json({ message: "coupen edited successfully" })
    } catch (error) {
        // console.log("error:::::::", error.message);
        if (error.message.includes('duplicate key')) {
            return res.status(400).json({ message: "duplicate coupon code" })
        }
    }

}

//user
const renderCoupon = async (req, res) => {
    const id = req.session.user.user._id
    const coupon = await Coupon.find()

    // console.log("coupons", coupon);
    res.render('user/coupon', { coupon, user: req.session.user.user.email })
}

//user
const applyCoupon = async (req, res) => {
    const user = await User.findOne({ email: req.session.user.user.email }).populate(["cart.product_id"]);
    const id = req.session.user.user._id
    const currentDate = new Date().toISOString().split('T')[0];

    // console.log("req.body:", req.body);
    const { totalPrice, shipping } = await getTotal(user)
    const amount_payable = totalPrice + shipping
    // console.log("ttl", amount_payable);
    const couponId = req.body.id
    const selectedCoupon = await Coupon.findOne({ _id: couponId })
    // console.log("selectedCoupopn", selectedCoupon);
    //checking for min purchase amount
    if (amount_payable < selectedCoupon.minPurchaseAmount) {
        // console.log("not applicable");
        return res.status(200).json({ message: "not applicable" })

    } else if (selectedCoupon.user_list.includes(id)) { //checking if it is already used 
        return res.status(200).json({ message: "already used" })

    } else if (selectedCoupon.exp_date < currentDate) { //checking if it is expired
        return res.status(200).json({ message: "Coupon expired" })


    }
    else if (selectedCoupon.description.includes('first order')) {
        const order = await Order.find({ customer_id: id, status: 'Delivered' })
        // console.log("order", order);
        if (order) {
            return res.status(200).json({ message: "not firstOrder" })
        } else {
            const discount = selectedCoupon.discount
            const maximumDiscount = selectedCoupon.maximumDiscount
            const used_count = selectedCoupon.used_count
            let discountAmount = ((discount / 100) * amount_payable)
            if (discountAmount >= maximumDiscount) {
                discountAmount = maximumDiscount
            }
            // console.log("discounte", discountAmount);
            const total_payable = amount_payable - discountAmount

            req.session.coupon = { total_payable, couponId, discountAmount }
            return res.status(200).json({ message: "firstOrder", })

        }
    }
    else {
        const { discount, maximumDiscount } = selectedCoupon
        let discountAmount = ((discount / 100) * amount_payable)
        if (discountAmount >= maximumDiscount) {
            discountAmount = maximumDiscount
        }
        // console.log("discounte", discountAmount);
        const total_payable = amount_payable - discountAmount
        req.session.coupon = { total_payable, couponId, discountAmount }
        // console.log("req.session:", req.session);
        // const cpn = await Coupon.updateOne(
        //     { _id: couponId },
        //     {
        //         $addToSet: {
        //             user_list: id
        //         }
        //     }
        // );

        // console.log("coponsss", cpn);

        return res.status(200).json({ message: "applicable" })
    }
}

//user
const removeCoupon = async (req, res) => {

    req.session.coupon = null
    return res.status(200).json({ message: "coupon removed" })
}
module.exports = { renderAddCoupon, addCoupon, coupon, deleteCoupon, renderEditCoupon, editCoupon, renderCoupon, applyCoupon, removeCoupon }