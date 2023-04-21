const router = require('express').Router();
const formidable = require('express-formidable');
const session = require('express-session');
const dev = require('../config');
const { isLoggedIn, isLoggedOut } = require('../helpers/authen');
const { loginAdmin, logoutAdmin, getAllUsersByAdmin } = require('../controllers/admin');

router.use(session({
    name: 'admin_session',
    secret: dev.app.sessionSecretKey || 'hdhdhsh',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 6000 },
}));

router.post('/login', isLoggedOut, loginAdmin);
router.get('/logout', isLoggedIn, logoutAdmin);
router.get('/dashboard', isLoggedIn, getAllUsersByAdmin);

module.exports = router;