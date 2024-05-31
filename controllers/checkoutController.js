const Address = require('../models/addressModel');
const User = require('../models/userModel');

const Coupon = require('../models/couponModel');
const { getTotal } = require('../utils/helper');

const renderCheckout = async (req, res) => {
  const user = await User.findOne({ email: req.session.user.user.email }).populate(['cart.product_id', 'default_address']);
  const addresses = await Address.find({ customer_id: req.session.user.user._id });
  if (!user.default_address) {
    user.default_address = addresses[0];
  }
  const afterdiscount = req.session.totalAmount;
  if (addresses.length > 0) {
    if (!req.session.coupon?.couponId) {
      let { totalPrice, shipping, totalMrp } = await getTotal(user);
      const { saveOnMrp, subtotal } = req.session.totals;
    
      res.render('user/checkout', { user, cartItems: user.cart, totalPrice, totalMrp, saveOnMrp, subtotal, discount: '', addresses, shipping, coupon: {} });

    }
    else {
      let { shipping, totalMrp } = await getTotal(user);
      let { total_payable, couponId, discountAmount } = req.session.coupon;

      const coupon = await Coupon.findOne({ _id: req.session.coupon.couponId });
      const { saveOnMrp, subtotal } = req.session.totals;
      res.render('user/checkout', { user, cartItems: user.cart, totalPrice: Math.round(total_payable), discount: Math.round(discountAmount), totalMrp, saveOnMrp, addresses, shipping, coupon, subtotal });
    }
  }
  else {

    res.redirect('/add-address');
  }
};

const newAddress = async (req, res) => {
  const user = req.session.user.user.email;
  res.render('user/address', { user });
};

const submitAddress = async (req, res) => {
  const user = await User.findOne({ email: req.session.user.user.email }).populate(['cart.product_id', 'default_address']);
  const userId = req.session.user.user._id;
console.log("addr",req.body);
  let address = await Address.create({ ...req.body, customer_id: userId });
  console.log("addrr",address);
  if (!user.default_address) {
    user.default_address = address[0];
  }
  return res.status(200).json({message:"address added"})

};

const chooseAddress = async (req, res) => {
  const userId = req.session.user.user._id;
  const { id } = req.body;
  const default_adress = await User.updateOne({ _id: userId }, { default_address: id });
  return res.status(200).json({ message: 'product added  succesful' });

};

const removeAddress = async (req, res) => {
  const user = await User.findOne({ _id: req.session.user.user._id }).populate('cart.product_id');
  // console.log("removeuser", user);
  const { id } = req.params;
  await Address.findOneAndDelete({ _id: id });
  return res.status(200).json({ message: 'product deleted  succesful' });

};

const renderPayment = async (req, res) => {
  const user = await User.findOne({ email: req.session.user.user.email }).populate(['cart.product_id', 'default_address']);
  const addresses = await Address.find({ customer_id: req.session.user.user._id });
  let totalAmountToPay;

  if (addresses.length > 0) {

    const { totalPrice, shipping } = await getTotal(user);
    const amount_payable = totalPrice + shipping;
    if (!req.session.coupon?.couponId) {
      totalAmountToPay = amount_payable;
    } else {
      totalAmountToPay = Math.round(req.session.coupon.total_payable);
    }

    res.render('user/payment', { totalAmountToPay, user });
  }
};

module.exports = {
  newAddress,
  renderCheckout,
  submitAddress,
  chooseAddress,
  removeAddress,
  renderPayment
};
