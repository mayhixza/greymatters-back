const express = require("express");
const router = express.Router();

const Alumni = require("../../models/alumni");
const Contacts = require("../../models/contacts");
const Members = require("../../models/members");
const Faq = require("../../models/faq");

const methodOverride = require("method-override");
const multer = require("multer");
const Grid = require("gridfs-stream");
const path = require("path");
const mongoose = require("mongoose");
const uuid = require("uuid");
const sharp = require("sharp");
const fs = require("fs");

// SETTINGS
router.use(express.json());
router.use(express.urlencoded({ extended: false }));
router.use(methodOverride("_method"));

// GRIDFS SETTINGS
const conn = mongoose.connection;
let gfs;
conn.once("open", () => {
  gfs = Grid(conn.db, mongoose.mongo);
  gfs.collection("fs");
});

const storage = multer.diskStorage({
  destination: ".",
  filename: (req, file, cb) => {
    cb(null, `${uuid.v4()}-${Date.now()}` + path.extname(file.originalname));
  },
});
const upload = multer({ storage: storage, limits: { fileSize: 1572864 } });

// Routes

router.get("/", (req, res) => {
  res.render("admin/admin");
});

// Get All

router.get("/alumni", async (req, res) => {
  let alumnis = await Alumni.find();
  // res.send(alumnis);
  res.render("manage/alumni", { alumnis: alumnis });
});

router.get("/contacts", async (req, res) => {
  let contacts = await Contacts.find();
  // res.send(contacts);
  res.render("manage/contacts", { contacts: contacts });
});

router.get("/faq", async (req, res) => {
  let faqs = await Faq.find();
  res.render("manage/faqs", { faqs: faqs });
});

router.get("/members", async (req, res) => {
  let members = await Members.find();
  // res.send(members);
  res.render("manage/members", { members: members });
});

// Add Routes
router.get("/add-alumni", (req, res) => {
  res.render("add/add-alumni");
});

router.post("/add-alumni", upload.single("img"), async (req, res) => {
  await sharp(req.file.filename)
    .toFormat("jpeg")
    .jpeg({ quality: 40, force: true })
    .toFile("toConvert.jpg");
  let filename = `${uuid.v4()}-${Date.now()}.jpg`;
  const writeStream = gfs.createWriteStream(filename);
  await fs.createReadStream(`./toConvert.jpg`).pipe(writeStream);
  fs.unlink("toConvert.jpg", (err) => {
    if (err) {
      res.send(err);
    }
  });
  fs.unlink(`${req.file.filename}`, (err) => {
    if (err) {
      res.send(err);
    }
  });

  let body = req.body;

  let sPlatforms = body.socialPlatform;
  let sURL = body.socialURL;
  let socials = [];

  if (Array.isArray(sPlatforms)) {
    for (let i = 0; i < sPlatforms.length; i++) {
      let social = {
        platform: sPlatforms[i],
        URL: sURL[i],
      };
      socials.push(social);
    }
  } else {
    socials = [
      {
        platform: sPlatforms,
        URL: sURL,
      },
    ];
  }

  let alumni = new Alumni({
    name: body.name,
    post: body.post,
    year: body.year,
    current: body.current,
    socials: socials,
    image: filename,
  });

  try {
    await alumni.save();
    res.redirect("/admin/alumni");
  } catch (err) {
    res.send(err);
  }
});

router.get("/add-contacts", (req, res) => {
  res.render("add/add-contacts");
});

router.post("/add-contact", async (req, res) => {
  let contact = new Contacts({
    post: req.body.post,
    mail: req.body.mail,
  });

  try {
    contact.save();
    res.redirect("/admin/contacts");
  } catch (err) {
    res.send(err);
  }
});

// router.get("/add-events", (req, res) => {
//     res.render("add/add-events");
// })

router.get("/add-faq", (req, res) => {
  res.render("add/add-faq");
});

router.post("/add-faq", async (req, res) => {
  let body = req.body;

  let faq = new Faq({
    question: body.question,
    answer: body.answer,
  });

  try {
    faq.save();
    res.redirect("/admin/faq");
  } catch (err) {
    res.send(err);
  }
});

router.get("/add-members", (req, res) => {
  res.render("add/add-members");
});

router.post("/add-member", upload.single("img"), async (req, res) => {
  // Compress
  await sharp(req.file.filename)
    .toFormat("jpeg")
    .jpeg({ quality: 40, force: true })
    .toFile("toConvert.jpg");
  let filename = `${uuid.v4()}-${Date.now()}.jpg`;
  const writeStream = gfs.createWriteStream(filename);
  await fs.createReadStream(`./toConvert.jpg`).pipe(writeStream);
  fs.unlink("toConvert.jpg", (err) => {
    if (err) {
      res.send(err);
    }
  });
  fs.unlink(`${req.file.filename}`, (err) => {
    if (err) {
      res.send(err);
    }
  });

  let body = req.body;

  let sPlatforms = body.socialPlatform;
  let sURL = body.socialURL;
  let socials = [];

  if (Array.isArray(sPlatforms)) {
    for (let i = 0; i < sPlatforms.length; i++) {
      let social = {
        platform: sPlatforms[i],
        URL: sURL[i],
      };
      socials.push(social);
    }
  } else {
    socials = [
      {
        platform: sPlatforms,
        URL: sURL,
      },
    ];
  }

  let member = new Members({
    name: body.name,
    event: body.event,
    socials: socials,
    image: filename,
    class: body.class,
  });

  try {
    await member.save();
    res.redirect("/admin/members");
  } catch (err) {
    res.send(err);
  }
});

// Delete

router.get("/delete-alumni/:id", async (req, res) => {
  let alumni = await Alumni.findById(req.params.id);
  gfs.remove({ filename: alumni.image, root: "fs" }, async (err, gridStore) => {
    if (err) {
      res.send(err);
    } else {
      await Alumni.deleteOne({ _id: req.params.id });
      res.redirect("/admin/alumnis");
    }
  });
});

router.get("/delete-contact/:id", async (req, res) => {
  await Contacts.deleteOne({ _id: req.params.id });
  res.redirect("/admin/contacts");
});

router.get("/delete-faq/:id", async (req, res) => {
  await Faq.deleteOne({ _id: req.params.id });
  res.redirect("/admin/faq");
});

router.get("/delete-member/:id", async (req, res) => {
  let member = await Members.findById(req.params.id);
  gfs.remove({ filename: member.image, root: "fs" }, async (err, gridStore) => {
    if (err) {
      res.send(err);
    } else {
      await Members.deleteOne({ _id: req.params.id });
      res.redirect("/admin/members");
    }
  });
});

// Edit

router.get("/edit-alumni/:id", async (req, res) => {
  let alumni = await Alumni.findById(req.params.id);
  res.render("edit/edit-alumni", { alumni: alumni });
});
router.put("/edit-alumni/:id", upload.single("img"), async (req, res) => {
  let body = req.body;

  let sPlatforms = body.socialPlatform;
  let sURL = body.socialURL;
  let socials = [];

  if (Array.isArray(sPlatforms)) {
    for (let i = 0; i < sPlatforms.length; i++) {
      let social = {
        platform: sPlatforms[i],
        URL: sURL[i],
      };
      socials.push(social);
    }
  } else {
    socials = [
      {
        platform: sPlatforms,
        URL: sURL,
      },
    ];
  }

  try {
    if (req.file) {
      // Compress
      await sharp(req.file.filename)
        .toFormat("jpeg")
        .jpeg({ quality: 40, force: true })
        .toFile("toConvert.jpg");
      let filename = `${uuid.v4()}-${Date.now()}.jpg`;
      const writeStream = gfs.createWriteStream(filename);
      await fs.createReadStream(`./toConvert.jpg`).pipe(writeStream);
      fs.unlink("toConvert.jpg", (err) => {
        if (err) {
          res.send(err);
        }
      });
      fs.unlink(`${req.file.filename}`, (err) => {
        if (err) {
          res.send(err);
        }
      });

      let alumni = await Alumni.findById(req.params.id);
      gfs.remove(
        { filename: alumni.image, root: "fs" },
        async (err, gridStore) => {
          if (err) {
            res.send(err);
          } else {
            await Alumni.updateOne(
              { _id: req.params.id },
              {
                $set: {
                  name: body.name,
                  post: body.post,
                  socials: socials,
                  year: body.year,
                  current: body.current,
                  image: filename,
                },
              }
            );
          }
        }
      );
    } else {
      await Alumni.updateOne(
        { _id: req.params.id },
        {
          $set: {
            name: body.name,
            post: body.post,
            socials: socials,
            year: body.year,
            current: body.current,
          },
        }
      );
    }
  } catch (err) {
    res.send(err);
  }
  res.redirect("/admin/alumni");
});

router.get("/edit-contact/:id", async (req, res) => {
  let contact = await Contacts.findById(req.params.id);
  res.render("edit/edit-contacts", { contact: contact });
});
router.put("/edit-contact/:id", async (req, res) => {
  await Contacts.updateOne(
    { _id: req.params.id },
    {
      $set: {
        post: req.body.post,
        mail: req.body.mail,
      },
    }
  );
  res.redirect("/admin/contacts");
});

router.get("/edit-faq/:id", async (req, res) => {
  let faq = await Faq.findById(req.params.id);
  res.render("edit/edit-faq", { faq: faq });
});

router.put("/edit-faq/:id", async (req, res) => {
  await Faq.updateOne(
    { _id: req.params.id },
    {
      $set: {
        question: req.body.question,
        answer: req.body.answer,
      },
    }
  );
  res.redirect("/admin/faq");
});

router.get("/edit-members/:id", async (req, res) => {
  let member = await Members.findById(req.params.id);
  res.render("edit/edit-members", { member: member });
});
router.put("/edit-members/:id", upload.single("img"), async (req, res) => {
  let body = req.body;
  let sPlatforms = body.socialPlatform;
  let sURL = body.socialURL;
  let socials = [];

  if (Array.isArray(sPlatforms)) {
    for (let i = 0; i < sPlatforms.length; i++) {
      let social = {
        platform: sPlatforms[i],
        URL: sURL[i],
      };
      socials.push(social);
    }
  } else {
    socials = [
      {
        platform: sPlatforms,
        URL: sURL,
      },
    ];
  }

  try {
    if (req.file) {
      // Compress
      await sharp(req.file.filename)
        .toFormat("jpeg")
        .jpeg({ quality: 40, force: true })
        .toFile("toConvert.jpg");
      let filename = `${uuid.v4()}-${Date.now()}.jpg`;
      const writeStream = gfs.createWriteStream(filename);
      await fs.createReadStream(`./toConvert.jpg`).pipe(writeStream);
      fs.unlink("toConvert.jpg", (err) => {
        if (err) {
          res.send(err);
        }
      });
      fs.unlink(`${req.file.filename}`, (err) => {
        if (err) {
          res.send(err);
        }
      });

      let member = await Members.findById(req.params.id);
      gfs.remove(
        { filename: member.image, root: "fs" },
        async (err, gridStore) => {
          if (err) {
            res.send(err);
          } else {
            await Members.updateOne(
              { _id: req.params.id },
              {
                $set: {
                  name: body.name,
                  event: body.event,
                  socials: socials,
                  class: body.class,
                  image: filename,
                },
              }
            );
          }
        }
      );
    } else {
      await Members.updateOne(
        { _id: req.params.id },
        {
          $set: {
            name: body.name,
            event: body.event,
            socials: socials,
            class: body.class,
          },
        }
      );
    }
  } catch (errr) {
    res.send(errr);
  }
  res.redirect("/admin/members");
});

module.exports = router;
