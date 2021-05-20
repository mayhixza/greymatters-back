const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
    res.render("client/home");
})

router.get("/alumni", (req, res) => {
    res.render("client/alumni");
})

router.get("/events", (req, res) => {
    res.render("client/events");
})

router.get("/contacts", (req, res) => {
    res.render("client/contacts");
})

router.get("/members", (req, res) => {
    res.render("client/members")
})

module.exports = router;