const User = require('../models/userModel');
const Products = require('../models/productModel');

//view cart 
let viewCart = async (req, res) => {
    // Find the user by their email stored in the session
    const user = await User.findOne({ email: req.session.user.user.email });
    // console.log("user_ones", user);
    // Check if the user exists and has a cart
    if (user && user.cart) {
        // Extract product IDs from the cart
        const productIds = user.cart.map(item => item.product_id);
        // Fetch product details for each product ID
        const products = await Products.find({ _id: { $in: productIds } });
        // console.log("products", products);

        // Combine cart items with product details
        const combinedCartItems = user.cart.map(cartItem => {
            // Find the matching product for the current cart item 
            const product = products.find(p => p._id.toString() === cartItem.product_id.toString());
            // Return a new object that combines the cart item and product details

            const price = product.selling_price * cartItem.quantity;
            const mrp = product.actual_price * cartItem.quantity;
            return {
                cart: cartItem,
                prod_detail: product,
                price: price,
                mrp: mrp
            };
        });
        // console.log("combinedCartItems", combinedCartItems);
        for (prod of combinedCartItems) {
            prod.price = prod.prod_detail.selling_price * prod.cart.quantity;
            prod.mrp = prod.prod_detail.actual_price * prod.cart.quantity;
            console.log("prod.price", prod.price);
        }

        let totalPrice = 0
        let totalMrp = 0
        for (i = 0; i < combinedCartItems.length; i++) {
            totalPrice += combinedCartItems[i].price;
            totalMrp += combinedCartItems[i].mrp;
            console.log("combinedCartItems[i].price", combinedCartItems[i].price);
            console.log("total price", totalPrice);
        }
        let shipping = 0
        if (totalPrice < 1500) {
            shipping = 60
        }

        // Render the 'user/cart' view and pass the combined cart items
        res.render('user/cart', { cartItems: combinedCartItems, totalPrice, user, totalMrp, shipping });

    }
}

//update quantity 
let updateQuantity = async (req, res) => {
    const { productId, newQuantity } = req.body;
    const user = await User.findOne({ email: req.session.user.user.email }).populate("cart.product_id");
    // console.log("Populated Cart:", user.cart);

    if (user && user.cart) {
        const cartItem = user.cart.find(item => item.product_id._id.toString() === productId);
        // console.log("cartItem", cartItem);
        if (cartItem) {
            //update quantity
            cartItem.quantity = newQuantity;
            console.log("updated cart", cartItem);
            await user.save();

            //fetch product details of the updated item
            const products = await Products.find({ _id: { $in: productId } })
            // console.log("products,", products);

            //calculate updated prices
            const price = cartItem.product_id.selling_price * cartItem.quantity;
            const mrp = cartItem.product_id.actual_price * newQuantity;
            console.log("price,mrp", price, mrp);

            //total price calculation
            console.log("user.cart", user.cart);
            let totalPrice = 0;
            let totalMrp = 0;
            user.cart.forEach(item => {
                const p = item.product_id.selling_price * item.quantity;
                const m = item.product_id.actual_price * item.quantity;
                console.log("mrp of each", m);
                totalPrice += p;
                totalMrp += m;
                console.log("mrp", totalMrp);
            });
            let shipping = 0
            if (totalPrice < 1500) {
                shipping = 60
            }

            return res.json({ totalPrice, totalMrp, price, mrp, shipping })
        }
    }

}


//adding item to cart
let addToCart = async (req, res) => {
    const userId = req.session.user.user._id
    console.log("userid", userId)
    const { id, quantity } = req.body
    const { cart } = await User.findOne({ _id: userId })
    console.log("cart", cart);
    const existingProduct = cart.find((el) => el.product_id.toString() === id)
    console.log("existing prod", existingProduct);
    if (existingProduct && existingProduct.quantity >= 5) {
        return res.status(200).json({ message: "maximum product" })
    }
    //checking for duplicate products
    if (cart.some(el => el.product_id.toString() === id)) {
        console.log("hiiiiiiiiiiiiii");
        await User.findOneAndUpdate({ _id: userId, 'cart.product_id': id }, {
            $inc: { "cart.$.quantity": quantity }
        }, { new: true })
        console.log("this product exists, quantity updated");
        console.log(cart);

        return res.status(200).json({ message: "product added  succesful" })



    }
    const updatedCart = await User.findOneAndUpdate({ _id: userId }, {
        $addToSet: {
            cart: {
                product_id: id,
                quantity: quantity,
            }
        }
    }, { new: true })

    console.log("cart", cart);

}

let removeItem = async (req, res) => {
    const { id } = req.body
    try {
        const user = await User.findOne({ _id: req.session.user.user._id }).populate("cart.product_id")
        const del = await User.findOneAndUpdate({ _id: user._id, "cart.product_id": id }, { $pull: { cart: { product_id: id } } })
        return res.status(200).json({ message: "product deleted  succesful" })
    } catch (error) {
        console.log("error", error);
    }

}


module.exports = { viewCart, addToCart, updateQuantity, removeItem }