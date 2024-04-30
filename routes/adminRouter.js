const express = require('express');
const router = express.Router();
const { authAdmin } = require('../middlewares/authMiddleware')
const { upload } = require('../middlewares/multer')

const adminController = require('../controllers/adminController')
const customerController = require('../controllers/customerController');
const categoryController = require('../controllers/categoryController');
const productController = require('../controllers/productController');
const orderController = require('../controllers/orderController')
const couponController = require('../controllers/couponController')

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

//Order management
router.get('/orders', orderController.listOrderAdminSde)
router.get('/order-details/:id', orderController.orderDetailAdminSide)
router.post('/change-status', orderController.changeStatus)

//Coupon management
router.get('/coupon', couponController.coupon)
router.get('/add-coupon', couponController.renderAddCoupon)
router.post('/add-coupon', couponController.addCoupon)
router.delete('/delete-coupon', couponController.deleteCoupon)
router.post('/edit-coupon', couponController.editCoupon)
module.exports = router;   