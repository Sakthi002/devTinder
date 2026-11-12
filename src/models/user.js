const mongoose = require("mongoose");
const { Schema } = mongoose;
const validator = require('validator')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const userSchema =new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 4,
        maxLength: 50
    },
    lastName: {
        type: String
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: (value) => validator.isEmail(value),
            message: (props) => `${props.value} is not a valid email`
        }
    },
    password: {
        type: String,
        required: true,
        validate: {
            validator: value => validator.isStrongPassword(value),
            message: "Not a strong password"
        }
    },
    age: {
        type: Number,
        min: 18
    },
    gender: {
        type: String,
        validate : {
            validator : (value) => {
                return ['male', 'female','others'].includes(value)
            },
            message : (props) => `${props.value} is not a valid gender`
        }
    },
    about: {
        type: String,
        default: "Default description for a user"
    },
    photoURL:{
        type: String,
        default: 'https://www.pngfind.com/pngs/m/292-2924933_image-result-for-png-file-user-icon-black.png',
        validate: {
            validator: (value)=> validator.isURL(value),
            message: props => `${props.value} not a valid URL`
        }
    },
    skills: {
        type: [String]
    }
}, {
    timestamps: true
});

userSchema.methods.getJWT = async function () {
    const user = this;
    const token = await jwt.sign({ _id: user.id }, 'DEV@Tinder@123')
    return token;
}

userSchema.methods.validatePassword = async function (password) {
    const user = this;
    const isvalidPassword = await bcrypt.compare(password, user.password)
    return isvalidPassword;
}

module.exports = mongoose.model("User", userSchema)