const Products = require('../models/productModel')
require('dotenv').config();

const connetDB = require('../config/db')

connetDB();
async function update() {
    const oldproducts = await Products.find()
    oldproducts.forEach(async element => {
        const match = { _id: element._id }
        const update = { actual_price: Number(element.actual_price) }
        await Products.updateOne(match, update)
        console.log("products", element.product_name);
    });
}
update()