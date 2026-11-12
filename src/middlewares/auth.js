const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {

    try {

        const { token } = req.cookies;

        if(!token) {
            throw new Error("Token is not valid one!!!!!!!!!")
        }

        const decodedData = await jwt.verify(token, 'DEV@Tinder@123');
        
        const { _id } = decodedData;
        
        const user = await User.findById(_id);

        if(!user) {
            throw new Error("User not found");
        }

        req.user = user;

        next();
        
    } catch (e) {

        res.status(404).send("ERROR : " + e.message);
    }
}

module.exports = { userAuth };