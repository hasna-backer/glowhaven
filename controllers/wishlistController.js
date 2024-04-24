//user side
let renderWishlilst = async (req, res) => {

    const user = await User.findOne({ email: req.session.user.user.email });
    if (user && user.wish_list) {

    }

}

//user side
let addToWishlilst = async (req, res) => {

}
//user side
let deleteWishlilst = async (req, res) => {

}

module.exports = {
    renderWishlilst,
    addToWishlilst,
    deleteWishlilst
}
