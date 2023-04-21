const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    name: {
        type: String,
        trim: true,
        required: [true, "name is required"],
        minlength: [2, "minimum length for name is 2 charachters"],
        maxlength: [100, "maximum lengh for name is 100 charachters"],
    },
    email: {
        type: String,
        required: [true, "user email is required"],
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Please enter a valid email',
        },
    },
    password: {
        type: String,
        required: [true, "user password is required"],
        min: 6,
    },
    phone: {
        type: String,
        required: [true, "phone number  is required"],
        min: 6,
    },
    is_admin: {
        type: Number,
        default: 0,
    },
    is_verified: {
        type: Number,
        default: 0,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    image: {
        data: Buffer,
        contentType: String,
        name: String
    },
})

const User = model('Users', userSchema);

module.exports = User;