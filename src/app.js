const express = require("express");

const app = express();
const { adminAuth, userAuth } = require("../middlewares/auth")

app.use('/admin', adminAuth);

app.get('/user/login', (req, res) => {
    res.send("Loggedin successfully!");
});

app.get('/user/data',userAuth, (req, res) => {
    res.send("User data sent");
});

app.get('/admin/getAllData', (req, res, next) => {
    res.send("All data sent")
});

app.get('/admin/deleteUser', (req, res, next) => {
    res.send("User deleted")
});

app.listen("3000", () => {
    console.log("Server running successfully!!!!!!!!!!!");
});