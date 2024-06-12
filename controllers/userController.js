const { render } = require('ejs');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const mongoose = require('mongoose');
const sendmail = require('../utils/mailer');
const generateOtp = require('../utils/generateOtp');
const User = require('../models/userModel');
const Order = require('../models/orderModel');

const Product = require('../models/productModel');
const Address = require('../models/addressModel');
const Category = require('../models/categoryModel');
const validate = require('../validations/signupValidation');
const { response } = require('express');
const { Express } = require('express');
const productModel = require('../models/productModel');
/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
const test = (req, res) => {
    res.render('user/wallet')
}


let homepage = async function (req, res, next) {
    const product = await Product.find({ status: { $ne: false }, delete: { $ne: true }, stock: { $ne: 0 } });
    let categoryId = product.category_id
    const category = await Category.findOne({ _id: categoryId })

    let updatedProducts = await Promise.all(product.map(async e => {
        let categoryId = e.category_id
        const category = await Category.findOne({ _id: categoryId })
        if (!category.discount) {
            const product = e.toObject()
            product.selling_price = Math.round(product.actual_price - ((product.discount / 100) * product.actual_price))
            // console.log("a", product.selling_price);
            return product
        } else {
            const product = e.toObject()
            product.selling_price = Math.round(product.actual_price - ((category.discount / 100) * product.actual_price))
            // console.log("b", product);
            return product  
        }
    }))
    if (req.session.user) {
            const userId = req.session.user.user._id;
// console.log("userId", userId)
    const user = await User.findOne({ _id: userId });
    console.log("user", user.name)
    return res.render('user/home', { title: 'Express', user:user.name, products: updatedProducts });
    }
       return res.render('user/home', { title: 'Express',user:'', products: updatedProducts });

    // console.log("user===", user)  

}


let renderSignup = async (req, res) => {
    try {
        const err = req.flash('error')[0]
        if (!req.session.user) {
            res.render('user/signup', { error: err })
        } else {
            res.redirect('/')
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
}

let doSignup = async (req, res) => {
    try {
        const { name, email, pass, phone } = req.body
        console.log(req.body);
        const isExist = await User.findOne({ email: email })
        // console.log('is exist : ', isExist)
        if (isExist == null) {
            let user = new User();
            user.email = email
            user.password = await bcrypt.hash(pass, 10);
            user.name = name
            user.phone = phone
            const newUser = await user.save();
            req.session.user = newUser;
            // console.log("new user:", newUser)
            if (newUser) {
                res.status(200).json({ message: 'signup succes!' })
            }
        }
        else {
            console.log('flash triggered')
            res.status(400).json({ error: 'Email already exist!' })
            // req.flash('error', 'Email already exist!')
    
        }
    } catch (error) {
        console.log(error);
    }
}




let renderOtp = async (req, res) => {
    try {

        const err = req.flash('error')[0]
        const otp = await generateOtp.generateOTP();
        const { email } = req.session.user;
        await User.findOneAndUpdate({ email }, { otp })
        // console.log("email:", email);
        sendmail.sendMail(email, String(otp), "OTP");
        req.session.destroy();
        res.render('user/otp', { error: err, email })
    } catch (error) {
        console.log(error)
    }
}

/**
 * @param {Express.Request} req
 * @param {Express.Response} res
 */
let verifyUser = async (req, res) => {
    try {
        const { otp, email } = req.body
        const user = await User.findOne({ email })
        if (user && Number(otp) === user.otp) {
            const filter = { email }
            const update = { is_verified: true }
            await User.findOneAndUpdate(filter, update)

            res.redirect('/login')
        } else {
            res.status(400).json({ error: 'Enter a valid OTP!' })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: 'Enter a valid OTP!' })
    }
}

let resendOtp = async (req, res) => {
    try {
        const err = req.flash('error')[0]
        const otp = await generateOtp.generateOTP();
        const { email } = req.body;
        await User.findOneAndUpdate({ email }, { otp })
        sendmail.sendMail(email, String(otp), "OTP");
        req.session.destroy();
        res.render('user/otp', { error: err, email })
    } catch (error) {
        console.log(error)
    }
}



let renderLogin = async (req, res) => {
    if (req.session.user && req.session.user.isLoggedin) {
        return res.redirect('/')
    }
    const err = req.flash('error')[0]

    res.render('user/login', { error: err })
}


// res.render('user/login')
let doLogin = async (req, res, next) => {
    const { email, pass } = req.body;
    const isExist = await User.findOne({ email: email });
    if (!isExist) {
        req.flash('error', 'email is not registered');
        return res.redirect('/login');
    }
    try {
        const isPasswordMatch = await bcrypt.compare(pass, isExist.password);
        if (isPasswordMatch) {
            const { _id, name, email, phone } = isExist;
            req.session.user = { user: { _id, name, email, phone }, isLoggedin: true };
            return res.redirect('/');
        }
        req.flash('error', 'Wrong password');
        return res.redirect('/login');
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res) => {
   res.render('user/forgotPassword')
}

const sendOtp = async (req, res) => {
   try {
     const email=req.body.email
       console.log("email", email);
       const user = await User.findOne({ email: email })
       console.log(user);
       if (!user) {
                return res.status(400).json({message:'user doesnt exist'})
       }
       console.log("user",user);
     const otp = await generateOtp.generateOTP();
     req.session.otp={email:email,otp:otp}
     sendmail.sendMail(email, String(otp), "OTP");
     return res.status(200).json({message:'otp send'})
   } catch (error) {
    console.log(error);
   }
}
const verifyOtp = async (req, res) => {
    try {
        console.log("otp", req.body.otp);
        console.log("session", req.session.otp.otp);
        if (req.body.otp === req.session.otp.otp) {
           return res.status(200).json({message:'otp same'})
        } else {
             return res.status(400).json({ message: "wrong otp" })
        }
    } catch (error) {
        console.log(error);
    }
   
}   

const resetPassword = async (req, res) => {
 res.render('user/resetPassword') 
}

const verifyPassword = async (req, res) => {
    console.log(req.body,"hhh",req.session.otp);
    const email = req.session.otp.email
    console.log("email:::",email);
    if (req.body.password === req.body.confirmPassword) {
         password = await bcrypt.hash(req.body.password, 10);
        const pwd = await User.findOneAndUpdate({ email: email }, { password: password })
     return res.status(200).json({message:'password reset'})
}
}  
  
let viewProfile = async (req, res) => {
    // const { user } = req.session.user
    try {
        const address = await Address.find({ customer_id: req.session.user.user._id })
        const user = await User.findOne({ email: req.session.user.user.email })
        res.render('user/profile', { user, address })
    } catch (error) {
        console.log(error);
    }
}

// let renderEditProfile = async (req, res) => {
//     const { user } = req.session.user
//     res.render('user/profileEdit', { user })
// }

let editProfile = async (req, res) => {
    try {
        const filter = { email: req.body.email }
        let user = await User.findOneAndUpdate(filter, req.body, { new: true }).select("-password")
        req.session.user.user = user
        // console.log("userrrrrrrrr", user);
        // console.log("session.user", req.session.user);
        // console.log("session.user.user", req.session.user.user);
        res.status(200).json({ message: 'edit Done' })
    } catch (error) {
        res.status(400).json({ message: 'error!!!' })

    }
}


// let renderViewProducts = async (req, res) => {
//     const { search,catgry,type,sort,price } = req.query
//     console.log("req.query",catgry,type,sort,price);
//     try {
//         if (!search) {
//             const products = await Product.find({ status: { $ne: false }, delete: { $ne: true } });
//             //stock mngt
//             if (products.stock === 0) {

//             }
//             //calculating discount
//             let categoryId = products.category_id
//             const category = await Category.findOne({ _id: categoryId })

//             let updatedProducts = await Promise.all(products.map(async e => {
//                 let categoryId = e.category_id
//                 const category = await Category.findOne({ _id: categoryId })
//                 if (!category.discount) {
//                     const product = e.toObject()
//                     product.selling_price = Math.round(product.actual_price - ((product.discount / 100) * product.actual_price))
//                     return product
//                 } else {
//                     const product = e.toObject()
//                     product.selling_price = Math.round(product.actual_price - ((category.discount / 100) * product.actual_price))
//                     return product
//                 }
//             }))
//             console.log("updatedProducts",updatedProducts);
//             return res.render('user/product', { user: req.session.user, products: updatedProducts });
//         }
//         const products = await Product.find({
//             product_name: { $regex: new RegExp(search, 'i') }
//         });
//         return res.render('user/product', { products, user: req.session.user });

//     } catch (error) {
//         console.log(error);
//     }

// };



let renderViewProducts = async (req, res) => {
    const { search, catgry, type, sort, price } = req.query;
    console.log("req.query", search, catgry, type, sort, price);

    try {
        // Base query to find products that are not deleted and are active
        let query = { status: { $ne: false }, delete: { $ne: true } };

        // Add search condition if 'search' is provided
        if (search) {
            query.product_name = { $regex: search, $options: 'i' };
        }

        // Add category condition if 'catgry' is provided
        if (catgry) {
            query.category_id = new mongoose.Types.ObjectId(catgry);
        }

        // Add type condition if 'type' is provided
        if (type) {
            query.type = type;  
        }

        // Add price range condition if 'price' is provided
        

        // Fetch products based on the constructed query
        let products = await Product.find(query);

        // Stock management
        // products = products.filter(product => product.stock > 0);

        // Calculating discount and final selling price
        let updatedProducts = await Promise.all(products.map(async e => {
            let categoryId = e.category_id;
            const category = await Category.findOne({ _id: categoryId });
            const product = e.toObject();

            if (!category.discount) {
                product.selling_price = Math.round(product.actual_price - ((product.discount / 100) * product.actual_price));
            } else {
                product.selling_price = Math.round(product.actual_price - ((category.discount / 100) * product.actual_price));
            }
            
            return product;
        }));

console.log("updatedProducts",updatedProducts);

        if (price) {
            const [minPrice, maxPrice] = price.split('-').map(Number);
            console.log(minPrice, maxPrice);
            // query.selling_price = { $gte: minPrice, $lte: maxPrice };
            // console.log(query);
            updatedProducts = updatedProducts.filter( product => product.selling_price < maxPrice && product.selling_price > minPrice)
        }

        // console.log("updatedProducts",updatedProducts);


        // Sorting the products if 'sort' is provided
        if (sort === 'highToLow') {
            updatedProducts.sort((a, b) => b.selling_price - a.selling_price);
        } else if (sort === 'lowToHigh') {
            updatedProducts.sort((a, b) => a.selling_price - b.selling_price);
        }

        console.log("updatedProducts", updatedProducts.map(e => e.selling_price));
        const categories=await Category.find({delete:{$ne:true}})
        return res.render('user/product', { user: req.session.user, products: updatedProducts,categories });

    } catch (error) {
        console.error(error);
        res.status(500).send("Server Error");
    }
};


const renderSingleProducts = async (req, res) => {
    const product = await Product.findById(req.params.id).populate("category_id");
    console.log("step1");
    let categoryId = product.category_id
        console.log("step 2");

    const category = await Category.findOne({ _id: categoryId })
        console.log("step 3");

    try {
        if (!category.discount) {
                console.log("if 1");

            const discountAmount = ((product.discount / 100) * product.actual_price)
                console.log("if 2");

            let sellingPrice = Math.round(product.actual_price - discountAmount)
                console.log("if 3");

            res.render('user/singleProduct', { product, user: req.session.user, sellingPrice })
    
        }
        else {
                console.log("else 1");

            const discountAmount = ((category.discount / 100) * product.actual_price)
            console.log("else 2");

            let sellingPrice = Math.round(product.actual_price - discountAmount)
                console.log("else 3");

            res.render('user/singleProduct', { product, user: req.session.user, sellingPrice })
        }
    } catch (error) {
        console.log(error);
    }

};

//search products
const searchProducts = async (req, res) => {
    const searchQuery = req.body.searchInput;

    try {
        const products = await Product.find({
            product_name: { $regex: new RegExp(searchQuery, 'i') }
        });
        res.json(products);
    } catch (error) {
        console.error("Error searching for products:", error);
        res.status(500).json({ error: "Internal server error" });
    }
}

//filter products
const filter = async (req, res) => {
    console.log("params",req.query);
}

//sort products
const sortProducts = async (req, res) => {
    console.log("option", req.body);
    const option = req.body.option
    try {
        const products = await Product.find({ status: { $ne: false }, delete: { $ne: true } });
        let updatedProducts = await Promise.all(products.map(async e => {
                    let categoryId = e.category_id
                    const category = await Category.findOne({ _id: categoryId })
                    if (!category.discount) {
                        const product = e.toObject()
                        product.selling_price = Math.round(product.actual_price - ((product.discount / 100) * product.actual_price))
                        return product
                    } else {
                        const product = e.toObject()
                        product.selling_price = Math.round(product.actual_price - ((category.discount / 100) * product.actual_price))
                        return product
                    }
        }))
        console.log("updatedProducts",updatedProducts);
         if (option == "highToLow") {
             data = updatedProducts.sort((a, b) => b.selling_price - a.selling_price);
             console.log("data",data);
            } else if (option == "lowToHigh") {
                data = updatedProducts.sort((a, b) => a.selling_price - b.selling_price);
            } else if (option == "releaseDate") {
                data = await Product.find({ status: { $ne: false }, delete: { $ne: true } }).sort({ createdAt: 1 });
            }
    
    return res.status(200).json({data})
    } catch (error) {
        console.log(error);
    }
}

//logout
const logout = (req, res) => {
    req.session.destroy()
    res.redirect('/login')
}
module.exports = {
test,
    homepage,
    renderSignup,
    doSignup,
    logout,
    renderLogin,
    doLogin,
    renderOtp,
    verifyUser,
    resendOtp,
    forgotPassword,
    sendOtp,
    verifyOtp,
    resetPassword,
    verifyPassword,
    renderViewProducts,
    renderSingleProducts,
    viewProfile,
    editProfile,
    searchProducts,
    filter,
    sortProducts
}