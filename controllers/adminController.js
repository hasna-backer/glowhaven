const Admin = require('../models/adminModel')
const User = require('../models/userModel')
const Order = require('../models/orderModel');
const Product = require('../models/productModel');
const Coupon = require('../models/couponModel');
const { getTopSellingProducts } = require('../utils/helper');
const { getOrderCountsBy3HourWindows, getOrderCountsBy7DayWindows } = require('../utils/chart');

const bcrypt = require('bcrypt')
const ExcelJS = require("exceljs")
const PDFDocument = require('pdfkit')




let dashboard = async (req, res) => {
    const today = new Date()
    const startOfDay = today.setHours(0, 0, 0, 0);
    const endOfDay = today.setHours(23, 59, 59, 999);

    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    // console.log("tdy", today);
    try {
        const salesCount = await Order.find({ createdAt: { $gte: startOfDay, $lte: endOfDay }, status: "Confirmed" }).countDocuments()
        // console.log("count", salesCount);
        //to find revenue of this month
        const revenueMonth = await Order.aggregate([
            { $match: { createdAt: { $gte: startOfMonth, $lt: endOfMonth } } },
            { $group: { _id: null, revenue: { $sum: "$total_amount" } } }
        ])
        const revenue = revenueMonth.length > 0 ? Math.round(revenueMonth[0].revenue) : 0;

        // console.log("revenue of Month", revenue);
        //count of customers
        const userCount = await User.countDocuments()
        // console.log("userCount", userCount);

        //top selling products
        const topSellilngProducts = await getTopSellingProducts()
        // console.log("topSellilngProducts", topSellilngProducts);

        topSellilngProducts.product.forEach(element => {
            // console.log("hhhhhhhh", element.product_name);
        });

        // const topProducts = await Order.aggregate([
        //     {
        //         $lookup: {
        //             from: "products",
        //             localField: "items.product_id",
        //             foreignField: "_id",
        //             as: "items.product"
        //         }
        //     }
        // ])

        // console.log("Products", Products);
        // Products.forEach(element => {
        //     console.log("products:", element);
        //     element.items.forEach(data => {
        //         console.log("items:", data.product_id.product_name);
        //     });
        // });
        res.render('admin/dashboard', { salesCount, revenue, userCount, topSellilngProducts: topSellilngProducts.product });

    } catch (error) {
        // console.log("error", error.message);
    }
}



let chart = async (req, res) => {
    try {
        const filter = req.query.filter
        // console.log("filter", filter);
        const date = new Date();
        let counts
        switch (filter) {
            case "today":
                counts = await getOrderCountsBy3HourWindows(date);
                break;
            case "month":
                counts = await getOrderCountsBy7DayWindows(date);
                break;

            default:
                break;
        }



        return res.send(counts);
    } catch (error) {
        // console.log(error.message);
        res.status(500).send({ error: 'An error occurred' });
    }
};



const renderLogin = async (req, res) => {
    const err = req.flash('error')[0]
    if (req.session.admin && req.session.isLoggedin) {
        res.redirect('/admin')
    }
    else {
        res.render('admin/login', { error: err });
    }
};

const doLogin = async (req, res) => {
    const { email, pass } = req.body;
    // console.log("email and pwd", req.body)
    const isExist = await Admin.findOne({ email: email })
    // console.log("findoneadmin", isExist)
    if (isExist == null) {
        req.flash('error', 'email is not registered');
        res.redirect('/admin/login')
    }
    else {
        const isPasswordMatch = await bcrypt.compare(pass, isExist.password)
        console.log('isPasswordMatch:', isPasswordMatch);
        if (isPasswordMatch) {
            delete isExist.password;
            req.session.admin = { admin: isExist, isloggedin: true }
            // console.log("session::::", req.session.admin);
            res.redirect('/admin');
            // console.log("homepage")
        }
        else {
            req.flash('error', 'wrong password');
            res.redirect('/admin/login')
            // console.log("loginpage...wrong password")

        }
    }
}

//sales report
const salesReport = async (req, res) => {
    // console.log("hiiii");
    const today = new Date()
    const prevdate = today.setDate(today.getDate() - 30)
    // console.log("date", prevdate);
    let startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(prevdate);
    let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
    // console.log("dates", startDate, endDate);

    const orders = await Order.find().populate({ path: "customer_id", select: "name" })
    // console.log("order123", order[0].items);
    // console.log("order111", orders);
    // orders.forEach((order) => {
    //     console.log(order.customer_id.name);
    // })
    const details = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: { $nin: ["Cancelled", "Failed"] },
            },
        },
        { $sort: { createdAt: -1 } },
        {
            $lookup: {
                from: "users",
                localField: "customer_id",
                foreignField: "_id",
                as: "customer"
            }
        },
        { $unwind: "$customer" },
        {
            $lookup: {
                from: "products",
                localField: "items.product_id",
                foreignField: "_id",
                as: "products"
            }
        },
        { $unwind: "$products" },
        {
            $lookup: {
                from: "categories",
                localField: "products.category_id",
                foreignField: "_id",
                as: "category"
            }
        },
        { $unwind: "$category" },
        {
            $project: {
                "address": 1,
                "total_amount": 1,
                "payment_method": 1,
                "coupon": 1,
                "status": 1,
                "createdAt": 1,
                "name": "$customer.name",
                "product_name": "$products.product_name",
                // "products": 1,  
                "category_discount": "$category.discount"
            }
        },

    ])
    details.forEach((order) => {
        // console.log("coupon", order.coupon);
    })
    // console.log("details", details);
    res.render('admin/report', { details, startDate, endDate })
}


// download excel
const downloadExcel = async (req, res) => {
    try {

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Sales Report');

        worksheet.columns = [
            { header: 'Order ID', key: 'orderId', width: 50 },
            { header: 'Customer', key: 'customer', width: 30 },
            { header: 'Date', key: 'date', width: 30 },
            { header: 'Total', key: 'totalAmount', width: 15 },
            { header: 'Payment', key: 'payment', width: 15 },
        ];

        const today = new Date()
        const prevdate = today.setDate(today.getDate() - 30)
        // console.log("date", prevdate);
        let startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(prevdate);
        let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const orders = await Order.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $nin: ["Cancelled", "Failed"] },
                },
            },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "users",
                    localField: "customer_id",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            { $unwind: "$customer" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "products"
                }
            },
            { $unwind: "$products" },
            {
                $lookup: {
                    from: "categories",
                    localField: "products.category_id",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $project: {
                    "address": 1,
                    "total_amount": 1,
                    "payment_method": 1,
                    "coupon": 1,
                    "status": 1,
                    "createdAt": 1,
                    "name": "$customer.name",
                    "product_name": "$products.product_name",
                    // "products": 1,  
                    "category_discount": "$category.discount"
                }
            },

        ])

        orders.forEach(order => {
            worksheet.addRow({
                orderId: order._id,
                customer: order.name,
                date: order.createdAt,
                totalAmount: order.total_amount,
                payment: order.status,
                products: order.product_name,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=salesReport.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        // console.log(error.message);
    }
}





// generate Pdf
const getSalesReportPdf = async (req, res) => {
    try {
        const doc = new PDFDocument();
        const filename = 'sales-report.pdf';

        const today = new Date()
        const prevdate = today.setDate(today.getDate() - 30)
        // console.log("date", prevdate);
        let startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(prevdate);
        let endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();

        const orders = await Order.aggregate([
            { $sort: { createdAt: -1 } },
            {
                $match: {
                    createdAt: { $gte: startDate, $lte: endDate },
                    status: { $nin: ["Cancelled", "Failed"] },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "customer_id",
                    foreignField: "_id",
                    as: "customer"
                }
            },
            { $unwind: "$customer" },
            {
                $lookup: {
                    from: "products",
                    localField: "items.product_id",
                    foreignField: "_id",
                    as: "products"
                }
            },
            { $unwind: "$products" },
            {
                $lookup: {
                    from: "categories",
                    localField: "products.category_id",
                    foreignField: "_id",
                    as: "category"
                }
            },
            { $unwind: "$category" },
            {
                $project: {
                    "address": 1,
                    "total_amount": 1,
                    "payment_method": 1,
                    "coupon": 1,
                    "status": 1,
                    "createdAt": 1,
                    "name": "$customer.name",
                    "product_name": "$products.product_name",
                    // "products": 1,  
                    "category_discount": "$category.discount"
                }
            },

        ])

        // console.log(orders);
        //     res.setHeader('Content-Type', 'application/pdf');
        //     res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        //     doc.pipe(res);
        //     doc.fontSize(12);
        //     doc.text('Sales Report', { align: 'center', fontSize: 16 });
        //     const margin = 5;
        //     doc
        //         .moveTo(margin, margin)
        //         .lineTo(600 - margin, margin)
        //         .lineTo(600 - margin, 842 - margin)
        //         .lineTo(margin, 842 - margin)
        //         .lineTo(margin, margin)
        //         .lineTo(600 - margin, margin)
        //         .lineWidth(3)
        //         .strokeColor('#000000')
        //         .stroke();

        //     doc.moveDown();
        //     //   console.log("nothing");

        //     const headers = ['Order ID', 'Name', 'Date', 'Total', 'Status'];

        //     let headerX = 20;
        //     const headerY = doc.y + 10;

        //     doc.text(headers[0], headerX, headerY);
        //     headerX += 200;

        //     headers.slice(1).forEach(header => {
        //         doc.text(header, headerX, headerY);
        //         headerX += 130;
        //     });

        //     let dataY = headerY + 25;

        //     orders.forEach((order, i) => {
        //         if (i > 19) {
        //             return;
        //         }
        //         const cleanedDataId = order._id.toString().trim();
        //         const cleanedName = order.name.trim();

        //         doc.text(cleanedDataId, 20, dataY, { width: 200 });
        //         doc.text(cleanedName, 230, dataY);
        //         doc.text(new Date(order.createdAt).toISOString().split('T')[0], 350, dataY, { width: 120 });
        //         doc.text(order.total_amount, 490, dataY);
        //         doc.text(order.status, 490, dataY);

        //         dataY += 30;
        //     });



        //     doc.end();

        // Ordered Item details
        // orders.forEach((order) => {
        //     order.orderedItems = order.orderedItems.map((item) => ({
        //         productDetails: {
        //             product_name: item.productDetails[0].product_name,
        //             price: item.price,
        //         },

        //     }));
        // });

        // startDate =
        //     startDate.getFullYear() +
        //     "-" +
        //     ("0" + (startDate.getMonth() + 1)).slice(-2) +
        //     "-" +
        //     ("0" + startDate.getUTCDate()).slice(-2);

        // endDate =
        //     endDate.getFullYear() +
        //     "-" +
        //     ("0" + (endDate.getMonth() + 1)).slice(-2) +
        //     "-" +
        //     ("0" + endDate.getUTCDate()).slice(-2);
   


        res.render("admin/pdf", {
            startDate,
            endDate,
            details: orders,

        })





    } catch (error) {
        // console.log(error.message);
    }

}




//logout
let logout = (req, res, next) => {
    req.session.destroy();
    res.redirect('/login');
}
module.exports = { dashboard, chart, renderLogin, doLogin, logout, salesReport, getSalesReportPdf, downloadExcel }