let Customer = require('../models/userModel');

const viewCustomer = async (req, res) => {
    let customer = await Customer.find({ isBanned: { $ne: true } })
    res.render('admin/customer', { customer });
}

const blockCustomer = async (req, res) => {
    const filter = { _id: req.params.id }
    const bann = await Customer.updateOne(filter, { $set: { isBanned: true } });
    res.redirect('/admin/customer')
}



module.exports = { viewCustomer, blockCustomer }