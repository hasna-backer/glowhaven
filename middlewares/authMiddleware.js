const authUser = (req, res, next) => {
    if (req.session.user && req.session.user.isLoggedin) {
        next();
    }
    else {
        res.redirect('/login');
    }
}


const authAdmin = (req, res, next) => {
    if (req.session.admin && req.session.admin.isloggedin) {
        next();
    }
    else {
        res.redirect('/admin/login');
    }
}

module.exports ={
    authUser,
    authAdmin
}