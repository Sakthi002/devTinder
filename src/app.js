const express = require("express");

const app = express();

app.get('/',(req, res) => {
    res.send("Hello from dashboard!!!!!!!!!")
})

app.get('/test',(req, res) => {
    res.send("Hello from server!!!!!!!!!")
})

app.get('/hello',(req, res) => {
    res.send("Hello from hello!!!!!!!!!")
})

app.listen("7777", () => {
    console.log("Server running successfully!!!!!!!!!!!");
});