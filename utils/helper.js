const Category = require('../models/categoryModel');

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



module.exports = { getTotal }
