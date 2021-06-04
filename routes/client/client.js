const express = require("express");
const router = express.Router();

const Alumni = require("../../models/alumni");
const Contacts = require("../../models/contacts");
const Members = require("../../models/members");
const Events = require("../../models/events");
const Faq = require("../../models/faq");

router.get("/", (req, res) => {
    res.render("client/home");
})

router.get("/alumni", async (req, res) => {
    let alumnis = await Alumni.find()
    res.json({alumnis: alumnis});
})

router.get("/events", async (req, res) => {
    let events = await Events.find()
    res.json({events: events});
})

router.get("/contacts", async (req, res) => {
    let contacts = await Contacts.find()
    res.json({contacts: contacts});
})

router.get("/members", async (req, res) => {
    let members = await Members.find()
    res.json({members: members});
})

router.get("/faq", async (req, res) => {
    let faqs = await Faq.find()
    res.json({faqs: faqs});
})

module.exports = router;