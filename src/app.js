const express = require("express");

const app = express();
app.use(express.json());

app.get('/user/:id', (req, res) => {
    console.log(req.params);
    res.status(200).json({ first_name : 'Sakthi', last_name: "Viji" });
})

app.post('/user', (req, res) => {
    console.log(req.body);
    res.status(200).json({ message : 'Updated successfully!' });
})

app.listen("3000", () => {
    console.log("Server running successfully!!!!!!!!!!!");
});