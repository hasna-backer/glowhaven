const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middlewares/authMiddleware')
const { upload } = require('../middlewares/multer')

const adminController = require('../controllers/adminController')
const customerController = require('../controllers/customerController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');

//Admin Actions
// router.get('/', authAdmin, adminController.dashboard)
router.get('/', adminController.dashboard)
router.get('/login', adminController.renderLogin)
router.post('/login', adminController.doLogin)
router.get('/logout', adminController.logout)


// Customer Management
router.get('/customer', customerController.viewCustomer)
router.get('/block-customer/:id', customerController.blockCustomer)

//Category Management 
router.get('/category', categoryController.viewCategory);
router.get('/add-category', categoryController.renderAddCategory);
router.post('/category-add', categoryController.addCategory);
router.get('/edit-category/:id', categoryController.renderEditCategory);
router.post('/edit-category/:id', categoryController.EditCategory);
router.get('/delete-category/:id', categoryController.deleteCategory);

//Product management  
router.get('/product', productController.viewProduct);
router.get('/add-product', productController.renderAddProduct);
router.post('/add-product', upload.fields([{ name: "img1" }, { name: "img2" }, { name: "img3" }]), productController.addProduct);
router.get('/edit-product/:id', productController.renderEditProduct);
router.post('/edit-product/:id', upload.fields([{ name: "img1" }, { name: "img2" }, { name: "img3" }]), productController.EditProduct);
router.get('/delete-product/:id', productController.deleteProduct);


module.exports = router;   