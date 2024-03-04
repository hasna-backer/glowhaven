require('dotenv').config();

const express = require('express');
const expressLayout = require('express-ejs-layouts');
const session = require('express-session');
const nocache = require('nocache');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var flash = require('connect-flash');

// var flash = require('connect-flash');


const app = express();
const port = 4010 || process.env.PORT;

// db connection
const connetDB = require('./config/db')
connetDB();



app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger('dev'));


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

//template engine 
app.use(expressLayout);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

//requiring routes
const userRoutes = require('./routes/userRouter');
const adminRoutes = require('./routes/adminRouter');

app.use("/", userRoutes)
app.use("/admin", adminRoutes)




app.listen(port, () => {
    console.log(`server is running on http://localhost:${4010}`)
}); 