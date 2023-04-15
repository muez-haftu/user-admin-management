const mongoose = require('mongoose');
const dev = require('.');

const connectDB = async() => {
    try {
        await mongoose.connect(dev.db.url)
            .then(() => console.log('Connected to Database!'));
    } catch (error) {
        console.log(error)
    }

}
module.exports = connectDB;