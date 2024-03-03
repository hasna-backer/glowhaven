const express=require('express');
const router=express.Router();
const adminController=require('../controllers/adminController')
const customerController=require('../controllers/customerController');


//Admin Actions
router.get('/',adminController.dashboard)
router.get('/login',adminController.renderLogin)
router.post('/login',adminController.doLogin)
router.get('/logout',adminController.logout)


// Customer Management
router.get('/customer',customerController.viewCustomer)
module.exports=router;