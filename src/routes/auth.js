const express = require("express");
const authRouter = express.Router();

const User = require("../models/user");
const { validateSignUpData } = require("../utils/validation");
const bcrypt = require("bcrypt");

// Create user
authRouter.post("/signup", async (req, res) => {
    try {
        // 1. validate
        validateSignUpData(req.body);

        // 2. hash the password
        const { firstName, lastName, emailId, password } = req.body;

        const hashPassword = await bcrypt.hash(password, 10);
        console.log(hashPassword);

        if (req.body?.skills?.length > 10) {
            throw new Error("Skills more than 10 not allowed");
        }

        const user = new User({
            firstName,
            lastName,
            emailId,
            password: hashPassword,
        });

        await user.save();

        res.send("User added successfully!");
    } catch (err) {
        res.status(400).send("Error occured::" + err.message);
    }
});

authRouter.post("/login", async (req, res) => {
    try {
        const { emailId, password } = req.body;

        const user = await User.findOne({ emailId: emailId });

        if (!user) {
            throw new Error("Invalid credentials!");
        }

        const isValidPassword = await user.validatePassword(password);

        if (isValidPassword) {
            const token = await user.getJWT();

            res.cookie("token", token, {
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            });

            res.json({ message: "Login successful!", data: user });
        } else {
            throw new Error("Invalid credentials!");
        }
    } catch (e) {
        res.status(400).send(`ERROR : ${e.message}`);
    }
});

authRouter.post("/logout", (req, res) => {
    // res.cookie('token', null, { expires : new Date(Date.now() )});
    res.clearCookie("token");

    res.send("Logged out successfully");
});

module.exports = authRouter;
