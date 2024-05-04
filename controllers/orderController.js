const User = require('../models/userModel');
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const mongoose = require('mongoose');


const { getTotal } = require('../utils/helper')


//admin
const listOrderAdminSde = async (req, res) => {
    console.log("req.params", req.params);
    const pageSize = 5;
    const currentPage = parseInt(req.query.page) || 1;
    const skip = (currentPage - 1) * pageSize;
    const limit = pageSize;
    const totalOrders = await Order.countDocuments();

    const orderItems = await Order.aggregate([
        { $sort: { createdAt: -1 } },
        { $skip: skip },
        { $limit: limit },
        {
            $lookup: {
                from: "users",
                localField: "customer_id",
                foreignField: "_id",
                as: "customerDetails"
            }
        },
        { $unwind: "$customerDetails" },

        {
            $lookup: {
                from: "products",
                localField: "items.product_id",
                foreignField: "_id",
                as: "items.product"
            }
        },
        {
            $addFields: {
                "items.img1": "$items.product.img1" // Add the product_name field from the joined documents
            }
        },
        {
            $project: {
                "address": 1,
                payment_method: 1,
                total_amount: 1,
                status: 1,
                "items.img1": 1,
                createdAt: 1,
                "name": "$customerDetails.name"
            }
        }
    ]);
    console.log("orderItems:", orderItems);


    // console.log(orderItems);
    res.render('admin/order', {
        orderItems, currentPage,
        totalPages: Math.ceil(totalOrders / pageSize)
    })
}

//Admin View Order details 
const orderDetailAdminSide = async (req, res) => {
    const order_id = new mongoose.Types.ObjectId(req.params.id)
    console.log("order_id", order_id);

    //getting customer details
    const customer = await Order.aggregate([
        {
            $match: { _id: order_id }
        },
        {
            $lookup: {
                from: "users",
                localField: "customer_id",
                foreignField: "_id",
                as: "customerDetails"
            }
        },
        { $unwind: "$customerDetails" },
        {
            $project: {
                name: "$customerDetails.name",
                phone: "$customerDetails.phone",
                email: "$customerDetails.email",
                createdAt: 1,
                address: 1,
                payment_method: 1,
                total_amount: 1
            }
        }

    ])

    // const cartItems = await Order.find({ _id: order_id }).populate('customer_id')
    // console.log("customer:", customer);


    const orderItem = await Order.aggregate([
        {
            $match: { _id: new mongoose.Types.ObjectId(order_id) }
        },
        {
            $unwind: "$items"
        },
        {
            $lookup: {
                from: "products",
                localField: "items.product_id",
                foreignField: "_id",
                as: "items.productDetails"
            }
        },
        {
            $addFields: {
                "items.product_name": "$items.productDetails.product_name",
                "items.img1": "$items.productDetails.img1",

            }
        },
        {
            $project: {
                _id: "$_id",
                customer_id: 1,
                address: 1,
                payment_method: 1,
                total_amount: 1,
                status: 1,
                createdAt: 1,
                updatedAt: 1,
                __v: 1,
                customerDetails: 1,
                items: 1
            }
        },
        {
            $group: {
                _id: "$_id",
                customer_id: { $first: "$customer_id" },
                address: { $first: "$address" },
                payment_method: { $first: "$payment_method" },
                total_amount: { $first: "$total_amount" },
                status: { $first: "$status" },
                createdAt: { $first: "$createdAt" },
                updatedAt: { $first: "$updatedAt" },
                __v: { $first: "$__v" },
                customerDetails: { $first: "$customerDetails" },
                items: { $push: "$items" }
            }
        }
    ]);
    console.log("orderItem", orderItem[0]);
    const total = orderItem[0].items.map(e => e.price * e.quantity)
    console.log("totaaaal", total);
    res.render('admin/orderDetail', { orderItem: orderItem[0], customer: customer[0], total })
}

//change status
const changeStatus = async (req, res) => {
    const { productId, orderId, status } = req.body
    console.log("req.body:", productId, orderId, status);
    const product = await Order.findOne({ _id: orderId, })
    console.log("RRRRR", product);

    // Update the status of the product within the order
    const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId },
        { $set: { status: status } },
        { new: true }
    );
    console.log("RRRRgfdgR", updatedOrder);
    return res.status(200).json({ message: "status changed" })

}

const createOrder = async (req, res) => {
    const user = await User.findOne({ email: req.session.user.user.email }).populate(["cart.product_id", "default_address"]);
    const { totalPrice, shipping } = getTotal(user)
    const amount_payable = totalPrice + shipping
    let totalAmountToPay
    console.log("req", req.body.paymentType, amount_payable);

    const paymentType = req.body.paymentType
    let status, order;
    if (paymentType === "cod") {
        status = "confirmed"
    } else {
        status = "pending"
    }
    let items = [];
    const cartList = user.cart;
    console.log("cartList", cartList);
    for (let i = 0; i < cartList.length; i++) {
        items.push({
            product_id: cartList[i].product_id._id,
            quantity: cartList[i].quantity,
            price: cartList[i].product_id.selling_price * cartList[i].quantity,
            status: status
        })
    }
    const address = user.default_address
    const selectedCoupon = await Coupon.findOne({ _id: req.session.coupon.couponId })

    const coupon = {
        coupon_id: req.session.coupon.couponId || "",
        discount: req.session.coupon.discountAmount || 0,
        code: selectedCoupon.coupon_code || ""
    }
    if (!req.session.coupon.couponId) {
        totalAmountToPay = amount_payable
    } else {
        totalAmountToPay = req.session.coupon.total_payable
    }
    order = {
        customer_id: user._id,
        items: items,
        address: `${address.house_name} (H), ${address.locality}, ${address.landmark},${address.city},${address.state}, pincode:${address.pincode}`,
        status: status,
        payment_method: paymentType,
        total_amount: totalAmountToPay,
        coupon: coupon


    }
    console.log("order", order);


    if (paymentType === "cod") {
        const createOrder = await Order.create(order)
        req.session.order = createOrder._id
        console.log("createOrder", createOrder);
        await Coupon.updateOne(
            { _id: req.session.coupon.couponId },
            {
                $addToSet: {
                    user_list: user._id
                }
            }
        );
        await User.updateOne({ _id: user._id }, { $unset: { cart: '' } })
        req.session.coupon = {}
        for (let i = 0; i < items.length; i++) {
            await Product.updateOne({ _id: items[i].product_id }, { $inc: { stock: -(items[i].quantity) } })
        }
        res.redirect('/orders')

    }


    // const { totalPrice, shipping } = getTotal(user)
    // const amount_payable = totalPrice + shipping
    // console.log("req", req.body.paymentType, amount_payable);
}

//view orders  
const renderOrder = async (req, res) => {
    const user = await User.findOne({ email: req.session.user.user.email }).populate(["cart.product_id", "default_address"]);
    const order_id = req.session.order
    console.log("order_id", order_id);
    const id = user._id
    // let cartItems = await Order.aggregate([  
    //     { $match: { customer_id: id } },
    //     { $unwind: "$items" },
    //     {
    //         $lookup: {
    //             from: 'products',
    //             localField: 'items.product_id',
    //             foreignField: '_id',
    //             as: 'prod_detail'
    //         }
    //     },
    //     { $unwind: "$prod_detail" },
    // ])

    const cartItems = await Order.find({ customer_id: id }).populate('items.product_id').sort({ createdAt: -1 });
    console.log("order render:", cartItems.map(el => el.items));
    console.log("cart items", cartItems);
    res.render('user/order', { cartItems })

}
const renderOrderDetails = async (req, res) => {
    // const user = await User.findOne({ email: req.session.user.user.email }).populate(["cart.product_id", "default_address"]);
    const order_id = req.params
    console.log("order_id", order_id);
    // const id = user._id

    // const cartItems = await Order.find({ _id: order_id }).populate('items.product_id')
    const customer = await Order.aggregate([
        {
            $match: { _id: order_id }
        },
        {
            $lookup: {
                from: "users",
                localField: "customer_id",
                foreignField: "_id",
                as: "customerDetails"
            }
        },
        { $unwind: "$customerDetails" }

    ])
    const cartItems = await Order.find({ _id: new mongoose.Types.ObjectId(order_id) }).populate('items.product_id')
    console.log("cartItems deatg", cartItems);
    console.log("customer deatg", customer);
    console.log("order render:", cartItems.map(el => el.items));
    res.render('user/orderDetails', { cartItems, customer: customer[0] })

}

const cancelOrder = async (req, res) => {
    console.log(req.body);
    const { orderId } = req.body;
    const updatedOrder = await Order.findOneAndUpdate(
        { _id: orderId },
        { $set: { "items.$[].status": "Cancelled", status: "Cancelled" } },
        { new: true }
    );
    console.log("RRRRgfdgR", updatedOrder);
    return res.status(200).json({ message: "order canccelled" })
}


module.exports = { listOrderAdminSde, orderDetailAdminSide, renderOrder, renderOrderDetails, createOrder, changeStatus, cancelOrder }