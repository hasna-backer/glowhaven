const authUser = (req, res, next) => {
    if (!req || !req.session || !req.session.user || !req.session.user.isLoggedin) {
        console.error('NullPointerReference: req, req.session, or req.session.user is null');
        return res.status(500).send('Internal Server Error');
    }
    next();
}

const authAdmin = (req, res, next) => {
    if (!req || !req.session || !req.session.admin) {
        console.error('NullPointerReference: req.session.admin is null');
        return res.status(500).send('Internal Server Error');
    }
    if (req.session.admin.isloggedin !== true) {
        console.error('UnhandledException: req.session.admin.isloggedin is not true');
        return res.status(401).send('Unauthorized');
    }
    next();
}

module.exports ={
    authUser,
    authAdmin
}
