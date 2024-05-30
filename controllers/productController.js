const Product = require('../models/productModel');
const Category = require('../models/categoryModel');

let viewProduct = async (req, res) => {

    try {
        const error = req.flash('error')[0];
        //pagination 
        const pageSize = 6;
        const currentPage = parseInt(req.query.page) || 1;
        let product = await Product.find({ delete: { $ne: true } })
            .skip((currentPage - 1) * pageSize)
            .limit(pageSize);
        let categoryId = product.category_id
        const category = await Category.findOne({ _id: categoryId })

        let updatedProducts = await Promise.all(product.map(async e => {
            let categoryId = e.category_id
            const category = await Category.findOne({ _id: categoryId })
            if (!category.discount) {
                const product = e.toObject()
                product.selling_price = Math.round(product.actual_price - ((product.discount / 100) * product.actual_price))
                return product
            } else {
                const product = e.toObject()
                product.selling_price = Math.round(product.actual_price - ((category.discount / 100) * product.actual_price))
                return product
            }
        }))
        const totalProducts = await Product.countDocuments();
        res.render('admin/products', {
            error,
            product: updatedProducts, currentPage,
            totalPages: Math.ceil(totalProducts / pageSize)
        });
    } catch (error) {
        console.log(error);
    }
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

        const product = await Product.create({
            ...req.body, img1, img2, img3
        });
        req.flash('error', 'Product added successfully!');
        res.redirect('/admin/product');


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
        const error = req.flash('error')[0];
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
       
        const filter = { _id: req.params.id }
        let product = await Product.updateOne(filter, update)
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
    const filter = { _id: req.params.id }
    const delet = await Product.updateOne(filter, { $set: { delete: true } });
    req.flash('error', "Product Deleted succussfully!")

    res.redirect('/admin/product');
}

module.exports = { viewProduct, renderAddProduct, addProduct, renderEditProduct, EditProduct, deleteProduct }