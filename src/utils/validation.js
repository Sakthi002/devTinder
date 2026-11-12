const validator = require('validator');

const validateSignUpData = function(data) {

    const { firstName, lastName, emailId, password } = data;

    if(!firstName || !lastName) {
     
        throw new Error("Name is not valid");
    
    } else if(!validator.isEmail(emailId)) {
    
        throw new Error("Email is not valid");
    
    } else if(!validator.isStrongPassword(password)) {
    
        throw new Error("Password is not strong");
    }
}

const validateEditProfileData = function (data) {

    const ALLOWED_EDIT_FIELDS = ["firstName", "lastName", "emailId", "age", "gender", "about", "skills", "photoURL"];

    return Object.keys(data).every(field => ALLOWED_EDIT_FIELDS.includes(field));
}

module.exports = { validateSignUpData, validateEditProfileData }