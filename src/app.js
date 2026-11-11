const express = require("express");

const connectDB = require('./config/database');

const User = require('./models/user');

const app = express();

app.use(express.json());

// Get user by id
app.get("/getUserById", async(req, res) => {

    const userId = req.body.id;

    try {

        const result = await User.findById(userId);

        res.send(result);

    } catch(err) {

        res.send("Something went wrong");
    }
});

// Get user by email
app.get('/getUser', async (req, res) => {

    const userMail = req.body.emailId;

    try {

        const user = await User.findOne({ emailId : userMail });

        if(user) {
            
            res.send(user);
        
        } else {
        
            res.status(404).send("User not found!")
        }

        // const users = await User.find({ emailId : userMail });

        // if(users.length) {
            
        //     res.send(users);
        
        // } else {
        
        //     res.status(404).send("User not found!")
        // }
    }
    catch(err) {

        res.send("Something went wronng " + err.message);
    }
    
});

// List of users
app.get('/feed', async (req, res) => {

    try {

        const result = await User.find({});

        res.send(result);
    }
    catch(err) {

        res.status(500).send("Somthing went wrong")
    }
});

// Create user
app.post("/signup", async (req, res) => {
    
    const user = new User(req.body)    
    
    try {

        await user.save();

        res.send("User added successfully!");
    
    } catch(err) {

        res.status(400).send("Error occured::" + err.message);
    }
})

// Delete user
app.delete('/user', async (req, res) => {

    const userId = req.body.userId;

    try {

        const result = await User.findByIdAndDelete(userId);

        console.log(result);

        if(result) {

            res.send("User deleted successfully!");
        
        } else {

            res.send("User not found to delete")
        }

    } catch (e) {

        res.send("Something went wrong!");
    }
});

// Update the user by id
app.patch('/user', async (req, res) => {

    const userId = req.body.userId;

    try {

        const result = await User.findByIdAndUpdate(userId, req.body);

        res.send("User updated successfully!")
        
    } catch (e) {

        res.send("Something went wrong!");
    }
})

// Update the user by email
app.patch('/user-by-mail', async (req, res) => {

    const emailId = req.body.emailId;

    try {

        const result = await User.findOneAndUpdate({ emailId: emailId }, req.body);

        res.send("User updated successfully!")
        
    } catch (e) {

        res.send("Something went wrong!");
    }
})

connectDB().then(res => {

    console.log("Database connected successfully");

    app.listen(3000, () => {
    
        console.log("Server running successfully at port 3000!!!!!!!!!!!");
    });

}).catch(e => {

    console.error("Error::Not connected to Database");
})