const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middlewares/authMiddleware')

const adminController = require('../controllers/adminController')
const customerController = require('../controllers/customerController');
const categoryController = require('../controllers/categoryController');

//Admin Actions
router.get('/', authAdmin, adminController.dashboard)
router.get('/login', adminController.renderLogin)
router.post('/login', adminController.doLogin)
router.get('/logout', adminController.logout)


// Customer Management
router.get('/customer', customerController.viewCustomer)

//Category Management 
router.get('/category', categoryController.viewCategory);
router.get('/add-category', categoryController.renderAddCategory);
router.post('/category-add', categoryController.addCategory);
router.get('/edit-category/:id', categoryController.renderEditCategory);
router.post('/edit-category/:id', categoryController.EditCategory);
router.get('/delete-category/:id', categoryController.deleteCategory);
module.exports = router;   