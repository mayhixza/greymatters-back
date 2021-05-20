const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require('bcrypt');

const User = require("../../models/user");

router.get("/", (req, res) => {

    //check if already logged in
    if(req.cookies['verify']!=null){
        return res.redirect("/admin");
    };

    res.render("auth/login");
})

router.post("/", async (req, res) => {

    // if user exists
    const userExists = await User.findOne({username:req.body.username});
    if(!userExists) {
        return res.render("auth/login", {error:"User doesn't exist"});
    }
    else {
    const user = await User.findOne({username: req.body.username})
    const validPass = await bcrypt.compare(req.body.password, user.password);

        if (!validPass){
            return res.render("auth/login", {error: "Incorrect password"})
        } else {
            const authToken = jwt.sign({_id:user._id},process.env.JWT_SECRET);
            res.cookie("verify", authToken, { maxAge: 2592000000 });            
            res.redirect("/admin");
        }
    }
})

module.exports = router;