const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Hoot = require("../models/hoot.js");
const router = express.Router();
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const multer = require("multer");
const upload = multer();

// S3 Client setup
const s3 = new S3Client({
  region: 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});

// ========== Protected Routes ===========

// Handle image uploads and save Hoot
router.post("/", verifyToken, upload.single('photo'), async function (req, res) {
  console.log(req.file, "<----FILE");

  try {
    req.body.author = req.user._id;  // Now req.user should be available

    // If a photo is included, upload it to S3
if (req.file && req.file.mimetype.startsWith("image/")) {
  const photoKey = `hoot-images/${Date.now()}-${req.file.originalname}`;
  const uploadParams = {
    Bucket: process.env.BUCKET,
    Key: photoKey,
    Body: req.file.buffer,
    ContentType: req.file.mimetype,
    // Remove the ACL: 'public-read' line
  };

  const command = new PutObjectCommand(uploadParams);
  await s3.send(command);

  req.body.photoUrl = `https://${process.env.BUCKET}.s3.amazonaws.com/${photoKey}`;
}


    // Save hoot data to MongoDB
    const hoot = await Hoot.create(req.body);
    hoot._doc.author = req.user;
    res.status(201).json(hoot);
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
});

// Other protected routes go here, with verifyToken applied

router.get("/", verifyToken, async (req, res) => {
  try {
    const hoots = await Hoot.find({})
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(hoots);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.get("/:hootId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId).populate([
      "author",
      "comments.author",
    ]);
    res.status(200).json(hoot);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.put("/:hootId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);

    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    const updatedHoot = await Hoot.findByIdAndUpdate(
      req.params.hootId,
      req.body,
      { new: true }
    );

    updatedHoot._doc.author = req.user;
    res.status(200).json(updatedHoot);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:hootId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);

    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }

    const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
    res.status(200).json(deletedHoot);
  } catch (error) {
    res.status(500).json(error);
  }
});

router.delete("/:hootId/comments/:commentId", verifyToken, async (req, res) => {
  try {
    res.status(200).json({ message: "Comment deleted" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting comment" });
  }
});

router.post("/:hootId/comments", verifyToken, async (req, res) => {
  try {
    req.body.author = req.user._id;
    const hoot = await Hoot.findById(req.params.hootId);
    hoot.comments.push(req.body);
    await hoot.save();

    const newComment = hoot.comments[hoot.comments.length - 1];
    newComment._doc.author = req.user;
    res.status(201).json(newComment);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
