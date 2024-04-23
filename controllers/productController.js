const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

let viewProduct = async (req, res) => {
    let product = await Product.find({})
    res.render('admin/products', { product: product });
}

let renderAddProduct = async (req, res) => {
    let category = await Category.find({ delete: { $ne: true } })
    console.log(category);
    const err = req.flash('error')[0]
    res.render('admin/addProducts', { error: err, category });
}

let addProduct = async (req, res) => {
    try {
        console.log(req.files.img1[0].filename);
        const img1 = req.files.img1[0].filename
        const img2 = req.files.img2[0].filename
        const img3 = req.files.img3[0].filename


        // if (req.body.product_name)
        // const dup = await Product.find({})
        console.log("req.body", req.body);
        const product = await Product.create({
            ...req.body, img1, img2, img3
        });
        res.redirect('/admin/add-product');


    } catch (error) {
        console.log((error.message || error));
        if (error.message.includes('duplicate key')) {
            req.flash('error', "Product already Exist!")
            res.redirect('/admin/add-product');
        }
    }
}

let renderEditProduct = async (req, res) => {
    try {
        console.log("renderEditProduct")
        const error = req.flash('erro')[0];
        let category = await Category.find({ delete: { $ne: true } })
        const product = await Product.findById(req.params.id);
        res.render('admin/editProduct', { error, product, category });
    } catch (error) {

    }
}

let EditProduct = async (req, res) => {
    try {
        // console.log(req.files.img1[0].filename);
        const update = { ...req.body }
        if (req.files.img1) {
            update.img1 = req.files.img1[0].filename;
        }
        if (req.files.img2) {
            update.img2 = req.files.img2[0].filename;
        }
        if (req.files.img3) {
            update.img3 = req.files.img3[0].filename;
        }
        // const img1 = req.files.img1[0].filename
        // const img2 = req.files.img2[0].filename
        // const img3 = req.files.img3[0].filename



        console.log(req.body);
        const filter = { _id: req.params.id }
        console.log("step1",)
        let product = await Product.updateOne(filter, update)
        console.log("step2",)
        req.flash('error', "Product Edited succussfully!")

        res.redirect('/admin/product');
    } catch (error) {
        console.log(error);
        if (error.message.includes('duplicate key')) {
            req.flash('error', "Product already Exist!")
            res.redirect('/admin/edit-product');
        }

    }
}


let deleteProduct = async (req, res) => {
    console.log('deleteCategory');
    const filter = { _id: req.params.id }
    const delet = await Product.updateOne(filter, { $set: { delete: true } });
    res.redirect('/admin/product');
}

module.exports = { viewProduct, renderAddProduct, addProduct, renderEditProduct, EditProduct, deleteProduct }