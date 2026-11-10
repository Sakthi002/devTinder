const express = require("express");

const app = express();

app.get('/getUserData', (req, res) => {
    try {
        
        throw new Error(" Something Not Correct!!!")
        
        res.send("User data sent!!!!");

    } catch(err) {

         res.status(500).send("Error ::" + err.message)
    }
});

app.use('/', (err, req, res, next) => {
    if(err) {
        res.status(500).send("Error Occurred::" + err.message)
    }
});

app.listen("3000", () => {
    console.log("Server running successfully!!!!!!!!!!!");
});