const express = require("express");
const router = express.Router();

const Events = require("../../models/events");
const User = require("../../models/user");

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
router.get("/", async (req, res) => {
  const events = await Events.find();
  res.render("manage/events", { events: events });
});

// Add
router.get("/add", (req, res) => {
  res.render("add/add-events");
});

router.post("/add", upload.single("img"), async (req, res) => {
  let body = req.body;
  let user = await User.findById(req.user.id);

  let event = new Events({
    title: body.title,
    content: body.content,
    link: body.link,
    // author: user.name,
    image: req.file.filename,
  });

  try {
    event.save();
    res.redirect("/admin/events");
  } catch (err) {
    res.send(err);
  }
});

// Edit
router.get("/edit/:id", async (req, res) => {
  let event = await Events.findById(req.params.id);
  res.render("edit/edit-events", { event: event });
});

router.put("/edit/:id", upload.single("img"), async (req, res) => {
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

    let event = await Events.findById(req.params.id);
    gfs.remove(
      { filename: event.image, root: "fs" },
      async (err, gridStore) => {
        if (err) {
          res.send(err);
        } else {
          await Events.updateOne(
            { _id: req.params.id },
            {
              $set: {
                title: req.body.title,
                content: req.body.content,
                link: req.body.link,
                image: filename,
              },
            }
          );
        }
      }
    );
  } else {
    await Events.updateOne(
      { _id: req.params.id },
      {
        $set: {
          title: req.body.title,
          content: req.body.content,
          link: req.body.link,
        },
      }
    );
  }
  res.redirect("/admin/events");
});

// Delete
router.get("/delete/:id", async (req, res) => {
  let event = await Events.findById(req.params.id);
  if (event.image) {
    gfs.remove(
      { filename: event.image, root: "fs" },
      async (err, gridStore) => {
        if (err) {
          res.send(err);
        } else {
          await Events.deleteOne({ _id: req.params.id });
          res.redirect("/admin/events");
        }
      }
    );
  } else {
    await Events.deleteOne({ _id: req.params.id });
    res.redirect("/admin/events");
  }
});

module.exports = router;
