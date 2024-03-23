const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authUser } = require('../middlewares/authMiddleware')

// User actions  
router.get('/', authUser, userController.homepage);
router.get('/signup', userController.renderSignup);
router.post('/signup', userController.doSignup);

router.get('/verify-user', userController.renderOtp);
router.post('/verify-user', userController.verifyUser);
router.get('/login', userController.renderLogin); //session mngt done
router.post('/login', userController.doLogin);
router.get('/logout', userController.logout);

// Products based routes
router.get('/product', authUser, userController.renderViewProducts);
router.get('/product-details/:id', authUser, userController.renderSingleProducts);

module.exports = router;    