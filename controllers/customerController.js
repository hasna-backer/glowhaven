let Customer = require('../models/userModel');

const viewCustomer = async (req, res) => {
    try {
        const pageSize = 6;
        const currentPage = parseInt(req.query.page) || 1;
        let customer = await Customer.find({ isBanned: { $ne: true } })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize);

        const totalCustomers = await Customer.countDocuments();
        res.render('admin/customer', {
            customer, currentPage,
            totalPages: Math.ceil(totalCustomers / pageSize)
        });
    } catch (error) {

    }
}

const blockCustomer = async (req, res) => {
    const filter = { _id: req.params.id }
    const bann = await Customer.updateOne(filter, { $set: { isBanned: true } });
    res.redirect('/admin/customer')
}



module.exports = { viewCustomer, blockCustomer }