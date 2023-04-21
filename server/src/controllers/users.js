const fs = require('fs')
const dev = require("../config");
const { securePassword, comparePassword } = require("../helpers/bcryptPassword");
const { sendEmailWithNodeMailer } = require("../helpers/email");
const User = require("../models/users");
const jwt = require('jsonwebtoken');


const registerUser = async(req, res) => {
    try {
        const { name, email, phone, password } = req.fields;
        const { image } = req.files;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({
                message: 'email,name ,phone or password is missing'
            })
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: 'password lengyh is  6'
            })
        }
        if (image && image.size > 1000000) {
            return res.status(400).json({
                message: 'maximum image size is 1MB  6'
            })
        }
        const isExist = await User.findOne({ email: email })
        if (isExist) {
            return res.status(400).json({
                message: 'user with this email already exist'
            })
        }

        const hashedPassword = await securePassword(password);
        //store temporarly

        const token = jwt.sign({ name, email, phone, hashedPassword, image }, dev.app.JwtSecretKey, { expiresIn: '10m' });
        //preparing mail
        const emailData = {
            email,
            subject: "Account Activation Email",
            html: `
            <h2> Hello ${name} . </h2>
            <p> Please click here to  activate your account <a href="${dev.app.clientUrl}/api/users/activate?token=${token}" >activate your
            account </p>     
            `, // html body
        };
        sendEmailWithNodeMailer(emailData);

        res.status(200).json({
            message: 'verification link has sent to ur email',
            token: token
        });
    } catch {
        res.status(500).json({
            message: error.message,
        });
    }
}
const verifyEmail = (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({
                message: 'token is missing',
            });
        }

        jwt.verify(token, dev.app.JwtSecretKey, async function(err, decoded) {
            if (err) {
                return res.status(401).json({
                    message: 'Token is expired',
                });
            }
            // decoded the data
            const { name, email, hashedPassword, phone, image } =
            decoded;
            console.log(name, email)
            console.log(image);

            const isExist = await User.findOne({ email: email })
            if (isExist) {
                return res.status(400).json({
                    message: 'user with this email already exist'
                })
            }
            //create the user with out image
            const newUser = new User({
                name: name,
                email: email,
                password: hashedPassword,
                phone: phone,
                is_verified: 1,

            })
            if (image) {
                newUser.image.data = fs.readFileSync(image.path);
                newUser.image.contentType = image.type;
                newUser.image.name = image.name;
            }
            //save the user
            const user = await newUser.save();
            if (!user) {
                res.status(400).json({
                    message: 'user was not saved',
                });

            }
            res.status(200).json({
                message: 'user is saved and u are ready to sign in'
            });
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}

const loginUser = async(req, res) => {
    try {
        const { email, password } = req.body;


        if (!email || !password) {
            return res.status(400).json({
                message: 'email or password is missing'
            })
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: 'password lengyh is  6'
            })
        }
        //checking if user exists
        const user = await User.findOne({ email: email })

        if (!user) {
            return res.status(400).json({
                message: 'user with this email already exist'
            })
        }
        //matching password
        const isPasswordMatched = await comparePassword(password, user.password);
        if (!isPasswordMatched) {
            return res.status(400).json({
                message: "email/password mismatched",
            })
        }
        // creating session
        req.session.userId = user._id;



        res.status(200).json({
            message: 'login successfull',
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}
const logoutUser = (req, res) => {
    try {
        req.session.destroy();
        res.clearCookie('user_session')
        res.status(200).json({
            message: 'logout successfull',
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}
const userProfile = async(req, res) => {
    try {
        const userData = await User.findById(req.session.userId, { password: 0 });

        res.status(200).json({
            message: 'go to profile successfull',
            user: userData,
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}
const deleteUser = async(req, res) => {
    try {
        await User.findByIdAndDelete(req.session.userId);

        res.status(200).json({
            message: 'delete was successfull',
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}

const updateUser = async(req, res) => {

    try {
        console.log(req.session.userId);
        console.log(req.fields);
        const nameA = req.fields.name;
        const phoneB = req.fields.phone;
        console.log(nameA)


        const hashedPassword = await securePassword(req.fields.password);
        console.log(hashedPassword);

        const updatedData = await User.findByIdAndUpdate(req.session.userId, { name: req.fields.name, phone: req.fields.phone, password: hashedPassword });
        // instead of the spread operator we can also use req.name,req.email ...
        //console.log(updatedData);
        if (!updatedData) {
            res.status(400).json({
                ok: false,
                message: 'user was not updated',
            })
        }
        if (req.files.image) {
            const { image } = req.files;
            updatedData.image.data = fs.readFileSync(image.path);
            updatedData.image.contentType = image.type;
            updatedData.image.name = image.name;
        }
        const updated = await updatedData.save();
        //  console.log(updated);

        res.status(200).json({
            message: 'user updated successfull',
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}
const forgetPassword = async(req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(404).json({
                message: 'email, phone or password is missing',
            });
        }
        if (password.length < 6) {
            return res.status(400).json({
                message: 'password lentgth is less than 6',
            })
        }
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(400).json({
                message: 'this email has not registered',
            });
        }
        const hashedPassword = await securePassword(password);
        //store temporarly

        const token = jwt.sign({ email, hashedPassword }, dev.app.JwtSecretKey, { expiresIn: '10m' });
        //preparing mail
        const emailData = {
            email,
            subject: "forget password reseting Email",
            html: `
            <h2> Hello ${user.name} . </h2>
            <p> Please click here to  activate your account <a href="${dev.app.clientUrl}/api/users/forget?token=${token}" >forget password
            account </p>     
            `, // html body
        };
        sendEmailWithNodeMailer(emailData);

        res.status(200).json({
            message: 'forget password successfull',
            token: token
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}

const resetPassword = (req, res) => {
    try {
        const { token } = req.body;
        if (!token) {
            res.status(400).json({
                message: 'token is missing',
            });
        }

        jwt.verify(token, dev.app.JwtSecretKey, async function(err, decoded) {
            if (err) {
                return res.status(401).json({
                    message: 'Token is expired',
                });
            }
            // decoded the data
            const { email, hashedPassword } =
            decoded;

            const isExist = await User.findOne({ email: email })
            if (!isExist) {
                return res.status(400).json({
                    message: 'user with this email does not exist'
                })
            }
            //update the reseted password
            const updatedData = await User.updateOne({ email: email }, {
                $set: {
                    password: hashedPassword,
                }
            })
            if (!updatedData) {
                res.status(400).json({
                    message: 'reset password was not successful'
                });
            }
            res.status(200).json({
                message: 'password reset successfull'
            });
        });

    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}

module.exports = {
    registerUser,
    verifyEmail,
    loginUser,
    logoutUser,
    userProfile,
    deleteUser,
    updateUser,
    forgetPassword,
    resetPassword
}