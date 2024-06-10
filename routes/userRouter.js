const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const checkoutController = require('../controllers/checkoutController');
const orderController = require('../controllers/orderController')
const wishlistController = require('../controllers/wishlistController')
const couponController = require('../controllers/couponController')

const { authUser } = require('../middlewares/authMiddleware')

// User actions  
router.get('/', authUser , userController.homepage);
router.get('/test', userController.test);

router.get('/signup', userController.renderSignup);
router.post('/signup', userController.doSignup);
router.get('/verify-user', userController.renderOtp);
router.post('/verify-user', userController.verifyUser);
router.post('/resend-otp', userController.resendOtp);
router.get('/login', userController.renderLogin); //session mngt done
router.post('/login', userController.doLogin); 
router.get('/forgot-password', userController.forgotPassword); 
router.post('/forgot-password', userController.sendOtp); 
router.post('/verify-otp', userController.verifyOtp); 
router.get('/reset-password', userController.resetPassword);
router.post('/reset-password', userController.verifyPassword);
router.get('/logout', userController.logout);

// Products based routes
router.get('/product', authUser,userController.renderViewProducts);
router.get('/product-details/:id',authUser, userController.renderSingleProducts);
router.post('/search', userController.searchProducts);
// router.post('/sort', userController.sortProducts);


//User profile
router.get('/profile', authUser, userController.viewProfile);
// router.get('/edit-profile', userController.renderEditProfile);
router.post('/edit-profile', authUser, userController.editProfile);

//cart    
router.get('/view-cart',authUser, cartController.viewCart)
router.post('/add-to-cart', cartController.addToCart)
router.post('/update-quantity', cartController.updateQuantity)
router.delete('/remove-item', cartController.removeItem)

// checkout
router.get('/checkout',authUser, checkoutController.renderCheckout)
router.get('/add-address',authUser, checkoutController.newAddress)
router.post('/add-address', checkoutController.submitAddress)
router.delete('/remove-address/:id', checkoutController.removeAddress)
router.post('/choose-address', checkoutController.chooseAddress)
router.get("/checkout/payment", authUser, checkoutController.renderPayment)
router.get('/wallet', checkoutController.wallet)


// Orders
router.get('/orders',authUser, orderController.renderOrder);
router.get('/order-detail/:id', authUser,orderController.renderOrderDetails);
router.post('/orders', orderController.createOrder);
router.post('/retry-order', orderController.retryCreateOrder);
router.post('/verify-payment', orderController.verify);
router.get('/retry-payment/:id',authUser, orderController.retryPayment);
router.get('/invoice-download/:id',authUser, orderController.invoiceDownload);

router.post('/cancel-order', orderController.cancelOrder);
router.post('/return-order', orderController.returnOrder);


//wishlist 
router.get('/wishlist',authUser,wishlistController.renderWishlilst);
router.post('/add-to-wishlist', wishlistController.addToWishlilst);
router.delete('/delete-wishlist', wishlistController.deleteWishlilst);

//Coupons 
router.get('/coupon',authUser, couponController.renderCoupon)
router.post('/apply-coupon', couponController.applyCoupon)
router.delete('/remove-coupon', couponController.removeCoupon)

//Discounts


module.exports = router;     