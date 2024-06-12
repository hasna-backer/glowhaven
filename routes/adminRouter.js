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
router.get('/', authAdmin, adminController.dashboard)
// router.get('/', adminController.dashboard)
router.get('/chart', adminController.chart);

router.get('/login', adminController.renderLogin)
router.post('/login', adminController.doLogin)
router.get('/logout', adminController.logout)


// Customer Management 
router.get('/customer',authAdmin,  customerController.viewCustomer)
router.get('/block-customer/:id', customerController.blockCustomer)

//Category Management 
router.get('/category',authAdmin,  categoryController.viewCategory);
router.get('/add-category',authAdmin,  categoryController.renderAddCategory);
router.post('/category-add', categoryController.addCategory);
router.get('/edit-category/:id',authAdmin,  categoryController.renderEditCategory);
router.post('/edit-category/:id', categoryController.EditCategory);
router.get('/delete-category/:id',authAdmin,  categoryController.deleteCategory);

//Product management  
router.get('/product', authAdmin, productController.viewProduct);
router.get('/add-product',authAdmin,  productController.renderAddProduct);
router.post('/add-product', upload.fields([{ name: "img1" }, { name: "img2" }, { name: "img3" }]), productController.addProduct);
router.get('/edit-product/:id',authAdmin,  productController.renderEditProduct);
router.post('/edit-product/:id', upload.fields([{ name: "img1" }, { name: "img2" }, { name: "img3" }]), productController.EditProduct);
router.get('/delete-product/:id', authAdmin, productController.deleteProduct);

//Order management
router.get('/orders', authAdmin, orderController.listOrderAdminSde)
router.get('/order-details/:id',authAdmin,  orderController.orderDetailAdminSide)
router.post('/change-status', orderController.changeStatus)

//Coupon management  
router.get('/coupon', authAdmin, couponController.coupon)
router.get('/add-coupon',authAdmin,  couponController.renderAddCoupon)
router.post('/add-coupon', couponController.addCoupon)
router.delete('/delete-coupon', couponController.deleteCoupon)
router.get('/edit-coupon/:id',authAdmin,  couponController.renderEditCoupon)
router.patch('/edit-coupon', couponController.editCoupon)

//Sales report
router.get('/sales-report',authAdmin,  adminController.salesReport);
// router.get('/generate-pdf', adminController.generatePdf);
router.get('/download-excel',authAdmin,  adminController.downloadExcel);
router.get('/sales-report/pdf-download',authAdmin,  adminController.getSalesReportPdf)

module.exports = router;         