const User = require('../models/userModel');
const Products = require('../models/productModel');
const Category = require('../models/categoryModel');

//view cart 
let viewCart = async (req, res) => {
    // Find the user by their email stored in the session
    const user = await User.findOne({
        email: req.session.user.user.email
    });
    // console.log("user_ones", user);
    // Check if the user exists and has a cart

    if (user && user.cart) {
        // Extract product IDs from the cart
        const productIds = user.cart.map(item => item.product_id);
        // Fetch product details for each product ID
        let products = await Products.find({
            _id: {
                $in: productIds
            }
        });
        //calculating selling price
        let categoryId = products.category_id
        const category = await Category.findOne({
            _id: categoryId
        })

        products = await Promise.all(products.map(async e => {
            let categoryId = e.category_id
            const category = await Category.findOne({
                _id: categoryId
            })
            if (!category.discount) {
                const product = e.toObject()
                product.selling_price = Math.round(product.actual_price - ((product.discount / 100) * product.actual_price))
                // console.log("a", product.selling_price);
                return product
            } else {
                const product = e.toObject()
                product.selling_price = Math.round(product.actual_price - ((category.discount / 100) * product.actual_price))
                // console.log("b", product);
                return product
            }
        }))
        console.log("basillll", products);
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
        console.log("xxxx", combinedCartItems);
        req.session.totals = {
            saveOnMrp: Math.round(totalMrp - totalPrice),
            subtotal: totalPrice
        }
        // Render the 'user/cart' view and pass the combined cart items
        res.render('user/cart', {
            user,
            cartItems: combinedCartItems,
            totalPrice,
            user,
            totalMrp,
            shipping
        });
    }
}

//update quantity 
let updateQuantity = async (req, res) => {
    const {
        productId,
        newQuantity
    } = req.body;
    const user = await User.findOne({
        email: req.session.user.user.email
    }).populate("cart.product_id");
    // console.log("Populated Cart:", user.cart);

    if (user && user.cart) {
        let cartItem = user.cart.find(item => item.product_id._id.toString() === productId);
        // console.log("cartItem", cartItem);
        if (cartItem) {
            cartItem = cartItem
            //update quantity
            cartItem.quantity = newQuantity;



            console.log("Updated User :", user.cart);
            await user.save()
            //fetch product details of the updated item
            let products = await Products.findOne({
                _id: {
                    $in: productId
                }
            })


            

            //calculating selling price
            let categoryId = products.category_id
            // console.log("cats,", categoryId);

            const category = await Category.findOne({
                _id: categoryId
            })

            if (!category.discount) {
                cartItem.product_id.selling_price = Math.round(cartItem.product_id.actual_price - ((cartItem.product_id.discount / 100) * cartItem.product_id.actual_price))
                console.log("cartItem.product_id.selling_price", cartItem.product_id.selling_price);

            } else {
                cartItem.product_id.selling_price = Math.round(cartItem.product_id.actual_price - ((category.discount / 100) * cartItem.product_id.actual_price))
                console.log("cartItem.pr", cartItem.product_id.selling_price);

            }



            //calculate updated price of single item
            const price = cartItem.product_id.selling_price * cartItem.quantity;

            // console.log("pppppppp:::", cartItem.product_id.selling_price, "pppp", cartItem.quantity);
            const mrp = cartItem.product_id.actual_price * newQuantity;
            // console.log("price,mrp", price, mrp);

            //total price calculation
            let totalPrice = 0;
            let totalMrp = 0;

            updatedUser = await User.findOne({
                email: req.session.user.user.email
            }).populate("cart.product_id");

            const userCart = updatedUser.cart.toObject()

            const updtedWithSellingPrice = await Promise.all(userCart.map(async e => {
                
                let categoryId = e.product_id.category_id
                const category = await Category.findOne({
                    _id: categoryId
                })


                if (category&&!category.discount) {
                    const product = e.product_id
                    product.selling_price = Math.round(product.actual_price - ((product.discount / 100) * product.actual_price))
                    product.quantity = e.quantity
                    // console.log("a", product.selling_price);
                    return product
                } else {
                    const product = e.product_id
                    product.selling_price = Math.round(product.actual_price - ((category.discount / 100) * product.actual_price))
                    product.quantity = e.quantity
                    // console.log("b", product);
                    return product
                }
            }))


            updtedWithSellingPrice.forEach(item => {
                console.log('item --> ', item);
                const p = item.selling_price * item.quantity;
                const m = item.actual_price * item.quantity;
                // console.log("mrp of each", m);
                totalPrice += p;
                totalMrp += m;
                // console.log("mrp", totalMrp);
                // console.log("totalPrice", totalPrice);
            });
            let shipping = 0
            if (totalPrice < 1500) {
                shipping = 60
            }

            console.log({
                totalPrice,
                totalMrp,
                price,
                mrp,
                shipping
            });
            return res.json({
                totalPrice,
                totalMrp,
                price,
                mrp,
                shipping
            })
        }
    }

}


//adding item to cart
let addToCart = async (req, res) => {
    const userId = req.session.user.user._id
    console.log("userid", userId)
    const {
        id,
        quantity
    } = req.body
    const {
        cart
    } = await User.findOne({
        _id: userId
    })
    console.log("cart", cart);
    const existingProduct = cart.find((el) => el.product_id.toString() === id)
    console.log("existing prod", existingProduct);
    if (existingProduct && existingProduct.quantity >= 5) {
        return res.status(200).json({
            message: "maximum product"
        })
    }
    //checking for duplicate products
    if (cart.some(el => el.product_id.toString() === id)) {
        console.log("hiiiiiiiiiiiiii");
        await User.findOneAndUpdate({
            _id: userId,
            'cart.product_id': id
        }, {
            $inc: {
                "cart.$.quantity": quantity
            }
        }, {
            new: true
        })
        console.log("this product exists, quantity updated");
        console.log(cart);

        return res.status(200).json({
            message: "product added  succesful"
        })



    }
    const updatedCart = await User.findOneAndUpdate({
        _id: userId
    }, {
        $addToSet: {
            cart: {
                product_id: id,
                quantity: quantity,
            }
        }
    }, {
        new: true
    })

    console.log("cart", cart);

}

let removeItem = async (req, res) => {
    const {
        id
    } = req.body
    try {
        const user = await User.findOne({
            _id: req.session.user.user._id
        }).populate("cart.product_id")
        const del = await User.findOneAndUpdate({
            _id: user._id,
            "cart.product_id": id
        }, {
            $pull: {
                cart: {
                    product_id: id
                }
            }
        })
        return res.status(200).json({
            message: "product deleted  succesful"
        })
    } catch (error) {
        console.log("error", error);
    }

}


module.exports = {
    viewCart,
    addToCart,
    updateQuantity,
    removeItem
}