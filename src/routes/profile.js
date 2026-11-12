const express = require("express");
const profileRouter = express.Router();

const { userAuth } = require('../middlewares/auth');
const { validateEditProfileData } = require("../utils/validation");

const bcrypt = require("bcrypt");
const validator = require("validator");

profileRouter.get('/profile/view', userAuth, async (req, res) => {

    try {
        
        const user = req.user;

        res.send(user);
        
    } catch (e) {

        res.status(400).send(`ERROR : ${e.message}`);
    }
});

profileRouter.patch('/profile/edit', userAuth, async(req, res) => {

    try {

        if(!validateEditProfileData(req.body)) {
            throw new Error("Invalid Edit Request");
        }

        const loggedInUser = req.user;

        Object.keys(req.body).forEach(key => loggedInUser[key] = req.body[key]);

        await loggedInUser.save();

        res.json({ message : `${loggedInUser.firstName} - your profile is updated.`, data : loggedInUser })
        
    } catch (e) {

         res.status(400).send(`ERROR : ${e.message}`);
    }
});

profileRouter.patch('/profile/password', userAuth, async(req, res) => {

    try {

        const loggedInUser = req.user;

        const isValidExistingPassword = await loggedInUser.validatePassword(req.body.existingPassword);

        if(!isValidExistingPassword) {
            throw new Error("Invalid existing password");
        }

        if(!validator.isStrongPassword(req.body.newPassword)) {
             throw new Error("Enter strong password");
        }

        const hashPassword = await bcrypt.hash(req.body.newPassword, 10);

        loggedInUser.password = hashPassword;

        await loggedInUser.save();

        res.json({ message: "Password updated successfully!"});

    } catch (e) {

        res.status(400).send(`ERROR : ${e.message}`);
    }
});

module.exports = profileRouter;
