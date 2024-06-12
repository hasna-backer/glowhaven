const authUser = (req, res, next) => {
    if (!req || !req.session || !req.session.user || !req.session.user.isLoggedin) {
        console.error('NullPointerReference: req, req.session, or req.session.user is null');
        return res.redirect('/login');
    }
    next();
}

const authAdmin = (req, res, next) => {
    if (!req || !req.session || !req.session.admin) {
        console.error('NullPointerReference: req.session.admin is null');
        return res.redirect('/admin/login');
    }
    if (req.session.admin.isloggedin !== true) {
        console.error('UnhandledException: req.session.admin.isloggedin is not true');
        return res.status(401).send('Unauthorized');
    }
    next();
}   

// const authUser = (req, res, next) => {
//     if (req.session.user && req.session.user.isLoggedin) {
//         next();
//     }
//     else {
//         res.redirect('/login');
//     }
// }


// const authAdmin = (req, res, next) => {
//     if (req.session.admin && req.session.admin.isloggedin) {
//         next();
//     }
//     else {
//         res.redirect('/admin/login');
//     }
// }


module.exports = {
    authUser,
    authAdmin
}
