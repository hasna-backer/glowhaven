require('dotenv').config();

const express = require('express');
var path = require('path');
const expressLayout = require('express-ejs-layouts');
const session = require('express-session');
const nocache = require('nocache');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('connect-flash');
const bodyParser = require('body-parser');

// var flash = require('connect-flash');


const app = express();
const port = process.env.PORT || 4011;

// db connection 
const connetDB = require('./config/db')
connetDB();



app.use(express.urlencoded({ extended: true }));
app.use(express.json({ extended: true }));
app.use(logger('dev'));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// cookie parser
app.use(cookieParser());


app.use(session({
    secret: process.env.SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: true,
    cookie: {
        maxAge: 72 * 60 * 60 * 1000,
        httpOnly: true
    }
}))
app.use(flash());



//clearing the cache of browser
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store')
    next()
})
//static files
app.use(express.static('public'));
// app.use(express.static(path.resolve('./public')));

//template engine 
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

//requiring routes
const userRoutes = require('./routes/userRouter');
const adminRoutes = require('./routes/adminRouter');
const { openBrowser } = require('./utils/automate');

app.use("/", userRoutes)
app.use("/admin", adminRoutes)


// //upload picture
// app.use(
//     fileUpload({
//         limits: {
//             fileSize: 10000000,
//         },
//         abortOnLimit: true,
//     })
// );



app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`)
});  