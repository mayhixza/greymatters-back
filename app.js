const express = require('express');
const app = express();
const PORT = process.env.PORT || 5001;
const cookieParser = require("cookie-parser");
const bcrypt = require('bcrypt');
const jwt = require("jsonwebtoken");
const Grid = require("gridfs-stream");

const mongoose = require("mongoose");

const dotenv = require("dotenv");
dotenv.config();

// Middleware Function
const authRoute = require("./middleware/authRoute");

// Database Connection
mongoose.connect(process.env.DB_URL, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true });

// Gridfs Settings
const conn = mongoose.connection;
let gfs;
conn.once('open', () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("fs");
});

// App Settings

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(__dirname + '/public'));

// Router Settings
const client = require("./routes/client/client")
app.use("/", client);

const admin = require("./routes/admin/admin");
app.use("/admin", authRoute, admin);

const login = require("./routes/auth/login");
app.use("/login", login);

const logout = require("./routes/auth/logout");
app.use("/logout", authRoute, logout);  

const events = require("./routes/admin/events")
app.use("/admin/events", events)

// Errors
app.get("*", (req, res) => {
    res.render("client/404");
});

// Sign up

const User = require("./models/user")

app.get("/signup", (req, res) => {
    res.render("auth/signup");
})

app.post("/signup", async (req, res) => {
    const hashedPass = await bcrypt.hash(req.body.password, 10);
    const user = new User({
        username: req.body.username,
        password: hashedPass
    });

    const userExists = await User.findOne({username: req.body.username})

    if (userExists) {
        return res.render("auth/signup", {error: "User already exists!n"});        
    }

    try {
        await user.save();
        return res.redirect("/admin");

    }catch(err) {
        console.log(err)
        return res.render('auth/signup',{error:"error"});
    }
})

// Port Listening

app.listen(PORT, () => {
    console.log(`Listening on port ${PORT}`)    
});