const express = require('express');
const router = express.Router();
const userController=require('../controllers/userController');
const { authUser } = require('../middlewares/authMiddleware')


router.get('/',authUser,userController.homepage);
router.get('/signup',userController.renderSignup);
router.post('/signup',userController.doSignup);
router.get('/login',userController.renderLogin);
router.post('/login',userController.doLogin);

router.get('/logout',userController.logout);




module.exports=router;  