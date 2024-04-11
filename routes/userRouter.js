const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const cartController = require('../controllers/cartController');
const checkoutController = require('../controllers/checkoutController');
const { authUser } = require('../middlewares/authMiddleware')

// User actions  
router.get('/', authUser, userController.homepage);
router.get('/signup', userController.renderSignup);
router.post('/signup', userController.doSignup);

router.get('/verify-user', userController.renderOtp);
router.post('/verify-user', userController.verifyUser);
router.post('/resend-otp', userController.resendOtp);
router.get('/login', userController.renderLogin); //session mngt done
router.post('/login', userController.doLogin);
router.get('/logout', userController.logout);

// Products based routes
router.get('/product', userController.renderViewProducts);
router.get('/product-details/:id', userController.renderSingleProducts);

//User profile
router.get('/profile', authUser, userController.viewProfile);
// router.get('/edit-profile', userController.renderEditProfile);
router.post('/edit-profile', authUser, userController.editProfile);

//cart  
router.get('/view-cart', cartController.viewCart)
router.post('/add-to-cart', cartController.addToCart)
router.post('/update-quantity', cartController.updateQuantity)
router.delete('/remove-item', cartController.removeItem)

// checkout
router.get('/checkout', checkoutController.renderCheckout)
router.get('/add-address', checkoutController.newAddress)
router.post('/add-adress', checkoutController.submitAddress)
router.delete('/remove-address/:id', checkoutController.removeAddress)
router.post('/choose-address', checkoutController.chooseAddress)
router
    .route("/checkout/payment")
    .get(checkoutController.renderPayment)
    .put(checkoutController.doPayment);


module.exports = router;     