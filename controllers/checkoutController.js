const Address = require('../models/addressModel');
const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const { getTotal } = require('../utils/helper')

let renderCheckout = async (req, res) => {
    const user = await User.findOne({ email: req.session.user.user.email }).populate(["cart.product_id", "default_address"]);
    console.log("userrrr:", user.cart);
    const addresses = await Address.find({ customer_id: req.session.user.user._id })
    console.log("address", addresses);
    if (!user.default_address) {
        user.default_address = addresses[0]
    }
    if (addresses.length > 0) {

        const { totalPrice, shipping } = getTotal(user)
        res.render('user/checkout', { user, cartItems: user.cart, totalPrice, addresses, shipping })
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
    console.log("addressssss");
    const userId = req.session.user.user._id

    let address = await Address.create({ ...req.body, customer_id: userId })
    console.log(address);
    console.log("address", req.body);
    res.redirect('/checkout')

}

const chooseAddress = async (req, res) => {
    userId = req.session.user.user._id
    const { id } = req.body
    console.log("choose addrss", id);
    const default_adress = await User.updateOne({ _id: userId }, { default_address: id })
    console.log("default address", default_adress)
    return res.status(200).json({ message: "product added  succesful" })

}

const removeAddress = async (req, res) => {
    const user = await User.findOne({ _id: req.session.user.user._id }).populate("cart.product_id")
    console.log("removeuser", user);
    const { id } = req.params
    const deletedAddress = await Address.findOneAndDelete({ _id: id });
    return res.status(200).json({ message: "product deleted  succesful" })


}

const renderPayment = async (req, res) => {
    const user = await User.findOne({ email: req.session.user.user.email }).populate(["cart.product_id", "default_address"]);
    const addresses = await Address.find({ customer_id: req.session.user.user._id })

    if (addresses.length > 0) {

        const { totalPrice, shipping } = getTotal(user)
        const amount_payable = totalPrice + shipping
        res.render('user/payment', { amount_payable })
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





