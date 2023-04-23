const router = require('express').Router();
const formidable = require('express-formidable');
const session = require('express-session');
const dev = require('../config');
const { isLoggedIn, isLoggedOut, isAdmin } = require('../helpers/authen');
const { loginAdmin, logoutAdmin, getAllUsersByAdmin, deleteUserByAdmin, exportUsers } = require('../controllers/admin');
const { registerUser } = require('../controllers/users');
const upload = require('../helpers/uploadSingleFile');

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
router.post('/register', upload.single('image'), registerUser);
router.delete('/dashboard', isLoggedIn, isAdmin, deleteUserByAdmin)
router.get('/dashboard/exportusers', exportUsers);

module.exports = router;