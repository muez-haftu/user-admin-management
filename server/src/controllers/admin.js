const fs = require('fs')
const dev = require("../config");
const { securePassword, comparePassword } = require("../helpers/bcryptPassword");
const { sendEmailWithNodeMailer } = require("../helpers/email");
const User = require("../models/users");
const jwt = require('jsonwebtoken');
const ExcelJS = require('exceljs');

const loginAdmin = async(req, res) => {
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
        //isAdmin
        if (user.is_admin === 0) {
            return res.status(400).json({
                message: 'not admin'
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
const logoutAdmin = (req, res) => {
    try {
        req.session.destroy();
        res.clearCookie('admin_session')
        res.status(200).json({
            message: 'logout successfull',
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}
const getAllUsersByAdmin = async(req, res) => {
    try {
        const users = await User.find({ is_admin: 1 });
        res.status(200).json({
            message: 'all admin users are ',
            users: users
        });
    } catch (error) {
        res.status(500).json({
            message: error.message,
        });
    }
}
const deleteUserByAdmin = async(req, res) => {
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

const exportUsers = async(req, res) => {
    try {
        const workbook = new ExcelJS.Workbook();
        const workSheet = workbook.addWorksheet('Users');
        workSheet.columns = [
            { header: 'Name', key: 'name' },
            { header: 'Email', key: 'email' },
            { hader: 'Password', key: 'password' },
            { header: 'Image', key: 'image' },
            { header: 'Phone', key: 'phone' },
            { header: 'IsAdmin', key: 'is_admin' },
        ];
        const userData = await User.find({ is_admin: 1 });
        userData.map((user) => {
            workSheet.addRow(user);
        });
        workSheet.getRow(1).eachCell((cell) => {
            cell.font = { bold: true };
        });

        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            'attachment; filename= ' + 'users.xlsx'
        );

        return workbook.xlsx.write(res).then(() => {
            res.status(200).end();
        })


    } catch (error) {
        res.status(500).send({
            message: error.message,
        })

    }
}


module.exports = {
    loginAdmin,
    logoutAdmin,
    getAllUsersByAdmin,
    deleteUserByAdmin,
    exportUsers,
}