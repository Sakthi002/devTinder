const express = require("express");

const app = express();

app.get('/user', (req, res) => {
    res.send({ first_name : 'Sakthi', last_name: "Viji" });
})

app.post('/user', async (req, res) => {
    res.send("Updated user successfully!");
})

app.delete('/user', (req, res) => {
    res.send("Deleted user successfully!");
})

app.use('/test',(req, res) => {
    res.send("Hello from server!!!!!!!!!")
})

app.listen("3000", () => {
    console.log("Server running successfully!!!!!!!!!!!");
});