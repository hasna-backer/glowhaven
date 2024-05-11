const Category = require('../models/categoryModel');

let viewCategory = async (req, res) => {
    let category = await Category.find({ delete: { $ne: true } })
    const err = req.flash('error')[0]
    res.render('admin/category', { category: category, error: err });
}

let renderAddCategory = async (req, res) => {
    const err = req.flash('error')[0]
    res.render('admin/addCategory', { error: err });
};


let addCategory = async (req, res) => {
    try {
        // const { cat_name, cat_status, description } = req.body
        let category = await Category.create(req.body)
        req.flash('error', "Category already Exist!")
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
        console.log("req.body", req.body);
        let category = await Category.updateOne(filter, req.body)
        req.flash('error', "Category edited succussfully!")
        res.redirect('/admin/category');

    } catch (error) {
        if (error.message.includes('duplicate key')) {
            req.flash('error', "Category already Exist!")
            res.redirect('/admin/edit-category');
        }
    }
}

let deleteCategory = async (req, res) => {
    const filter = { _id: req.params.id }
    console.log('deleteCategory', filter);
    const delet = await Category.updateOne(filter, { $set: { delete: true } });
    req.flash('error', "Category Deleted succussfully!")
    res.redirect('/admin/category');
}


module.exports = { viewCategory, renderAddCategory, addCategory, renderEditCategory, EditCategory, deleteCategory }  