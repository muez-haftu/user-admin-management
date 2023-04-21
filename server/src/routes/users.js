const {
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
    userProfile,
    deleteUser,
    updateUser,
    forgetPassword,
    resetPassword
} = require('../controllers/users');

const router = require('express').Router();
const formidable = require('express-formidable');
const session = require('express-session');
const dev = require('../config');
const { isLoggedIn, isLoggedOut } = require('../helpers/authen');

router.use(session({
    name: 'user_session',
    secret: dev.app.sessionSecretKey || 'hdhdhsh',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 10 * 6000 },
}));

router.post('/register', formidable(), registerUser);
router.post('/verify-email', verifyEmail);
router.post('/login', isLoggedOut, loginUser);
router.get('/logout', isLoggedIn, logoutUser);
router.get('/userprofile', isLoggedIn, userProfile);
router.delete('/', isLoggedIn, deleteUser)
router.put('/', isLoggedIn, formidable(), updateUser);
router.post('/forget-password', isLoggedOut, forgetPassword)
router.post('/reset-password', isLoggedOut, resetPassword)

module.exports = router;