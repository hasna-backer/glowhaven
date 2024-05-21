const Category = require('../models/categoryModel');
const Order = require('../models/orderModel');


const getTotal = async (user) => {
    let totalPrice = 0;
    let totalMrp = 0;
    // let categoryId = products.category_id
    // const category = await Category.findOne({ _id: categoryId })
    console.log("user.cart", user.cart);
    products = await Promise.all(user.cart.map(async e => {
        let categoryId = e.product_id.category_id
        console.log("catid:", e);
        const category = await Category.findOne({ _id: categoryId })
        if (!category.discount) {
            const product = e.product_id
            product.selling_price = Math.round(product.actual_price - ((product.discount / 100) * product.actual_price))
            // console.log("a", product.selling_price);
            return e
        } else {
            const product = e.product_id
            product.selling_price = Math.round(product.actual_price - ((category.discount / 100) * product.actual_price))
            // console.log("b", product);
            return e
        }
    }))
    products.forEach(item => {
        const price = item.product_id.selling_price * item.quantity;
        totalPrice += price;
        const mrp = item.product_id.actual_price * item.quantity;
        totalMrp += mrp;
        console.log("totalPrice:", totalPrice);
    });
    let shipping = 0
    if (totalPrice < 1500) {
        shipping = 60
    }
    console.log("shipping:", shipping, "totalPrice:", totalPrice);

    return { totalPrice, shipping, totalMrp }
}

const getTopSellingProducts = async () => {

    const product = await Order.aggregate([
        { $match: { status: "Delivered" } },
        { $unwind: "$items" },
        { $group: { _id: "$items.product_id", count: { $sum: "$items.quantity" }, revenue: { $sum: "$items.price" } } },
        { $sort: { count: -1 } },
        { $limit: 10 },
        {
            $lookup: {
                from: "products",
                localField: "_id",
                foreignField: "_id",
                as: "productDetails"
            }
        },
        { $unwind: "$productDetails" },
        {
            $project: {
                _id: 1,
                count: 1,
                product_name: "$productDetails.product_name",
                img1: "$productDetails.img1",
                revenue: 1,

            }
        }
    ]);

    console.log("Products", product);


    const delivered = await Order.aggregate([
        { $match: { status: "Delivered" } },
        { $unwind: "$items" }
    ])
    console.log("delivered", delivered);
    return { product }

}

module.exports = { getTotal, getTopSellingProducts }
