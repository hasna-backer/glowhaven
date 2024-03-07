const Category = require('../models/categoryModel');

let viewCategory = async (req, res) => {
    let category = await Category.find({ delete: { $ne: true } })
    res.render('admin/category', { category: category });
}

let renderAddCategory = async (req, res) => {
    const err = req.flash('error')[0]
    res.render('admin/addCategory', { error: err });
};


let addCategory = async (req, res) => {
    try {
        // const { cat_name, cat_status, description } = req.body
        let category = await Category.create(req.body)
        res.redirect('/admin/category');
    } catch (error) {
        console.log((error.message || error));
        if (error.message.includes('duplicate key')) {
            req.flash('error', "Category already Exist!")
            res.redirect('/admin/add-category');
        }
    }
}


let renderEditCategory = async (req, res) => {
    try {
        const error = req.flash('error')[0]
        const category = await Category.findById(req.params.id);
        res.render('admin/editCategory', { category, error });
    } catch (error) {

    }
}


let EditCategory = async (req, res) => {
    try {
        const { cat_name, cat_status, description } = req.body;
        const filter = { _id: req.params.id }
        let category = await Category.updateOne(filter, req.body)
        res.redirect('/admin/category');

    } catch (error) {
        if (error.message.includes('duplicate key')) {
            req.flash('error', "Category already Exist!")
            res.redirect('/admin/edit-category');
        }
    }
}

let deleteCategory = async (req, res) => {
    console.log('deleteCategory');
    const filter = { _id: req.params.id }
    const delet = await Category.updateOne(filter, { $set: { delete: true } });
    res.redirect('/admin/category');
}

module.exports = { viewCategory, renderAddCategory, addCategory, renderEditCategory, EditCategory, deleteCategory }  