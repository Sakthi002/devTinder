const User = require("../models/user");
const jwt = require("jsonwebtoken");

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).send("Please login to continue");
        }

        const decodedData = await jwt.verify(token, process.env.JWT_SECRET);

        const { _id } = decodedData;

        const user = await User.findById(_id);

        if (!user) {
            throw new Error("User not found");
        }

        req.user = user;

        next();
    } catch (e) {
        res.status(400).send("ERROR : " + e.message);
    }
};

module.exports = { userAuth };
