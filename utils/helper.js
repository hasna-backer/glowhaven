
const getTotal = (user) => {
    let totalPrice = 0;
    user.cart.forEach(item => {
        const p = item.product_id.selling_price * item.quantity;
        console.log("price of each", p);
        totalPrice += p;
    });
    let shipping = 0
    if (totalPrice < 1500) {
        shipping = 60
    }
    return { totalPrice, shipping }
}



module.exports = { getTotal }
