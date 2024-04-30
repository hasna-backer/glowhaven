const User = require('../models/userModel');
const Product = require('../models/productModel');


//user side
let renderWishlilst = async (req, res) => {

    const user = await User.findOne({ email: req.session.user.user.email }).populate('wish_list');
    console.log("user", user.wish_list);

    if (user && user.wish_list) {
        const itemIds = user.wish_list.map(e => e.product_id)
        const items = await Product.find({ _id: { $in: itemIds } })
        console.log("items", items);
        res.render('user/wishlist', { items, user })
    }
}

//user side
let addToWishlilst = async (req, res) => {
    const userId = req.session.user.user._id
    console.log("userid", userId)
    const { id } = req.body
    const product = await User.find({ 'wish_list.product_id': id })
    console.log("product", product);
    if (product.length === 0) {
        const wishlist = await User.findOneAndUpdate({ _id: userId },
            {
                $addToSet: {
                    wish_list: {
                        product_id: id
                    }
                }
            }, { new: true })
        console.log("wishlist", wishlist);
        return res.status(200).json({ message: " added to wishlist" })
    }

}
//user side
let deleteWishlilst = async (req, res) => {
    const { id } = req.body
    try {
        const user = await User.findOne({ _id: req.session.user.user._id }).populate("wish_list.product_id")
        const del = await User.findOneAndUpdate({ _id: user._id, "wish_list.product_id": id }, { $pull: { wish_list: { product_id: id } } })
        return res.status(200).json({ message: "product deleted  succesful" })
    } catch (error) {
        console.log("error", error);
    }

}

module.exports = {
    renderWishlilst,
    addToWishlilst,
    deleteWishlilst
}
