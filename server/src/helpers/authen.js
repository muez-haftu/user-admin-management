const User = require("../models/users");

const isLoggedIn = (req, res, next) => {
    try {
        if (req.session.userId) {
            next();
        } else {
            return res.status(400).json({ message: 'please login' });
        }
    } catch (error) {
        console.log(error);
    }
}
const isLoggedOut = (req, res, next) => {
    try {
        if (req.session.userId) {
            return res.status(400).json({ message: 'please logout first' });
        }
        next();
    } catch (error) {
        console.log(error);
    }
}
const isAdmin = async(req, res, next) => {
    try {
        if (req.session.userId) {
            const id = req.session.userId;
            const admin = await User.findById(id);
            if (admin.is_admin === 1) {
                next();
            } else {
                return res.status(4000).json({
                    message: 'you are not an admin'
                })
            }

        } else {
            return res.status(400).json({ message: 'please log in' });
        }
    } catch (error) {
        console.log(error);
    }
}


module.exports = { isLoggedIn, isLoggedOut, isAdmin };