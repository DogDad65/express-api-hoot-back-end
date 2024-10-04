const express = require("express");
const verifyToken = require("../middleware/verify-token.js");
const Hoot = require("../models/hoot.js");
const router = express.Router();

// ========== Public Routes ===========
// (e.g., Add public routes that don't require authentication here)

// ========= Protected Routes =========
router.use(verifyToken);

// @route   POST /hoots
// @desc    Create a new hoot
router.post("/", async (req, res) => {
  console.log(req.body); // Log the incoming request body
  try {
    const hoot = new Hoot({
      title: req.body.title,
      text: req.body.text,
      category: req.body.category,
      content: req.body.content,
      author: req.user._id, // Assuming the user is set in verifyToken middleware
    });
    await hoot.save();
    res.status(201).json(hoot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   GET /hoots
// @desc    Get all hoots
router.get("/", async (req, res) => {
  try {
    // Retrieve all hoots, populate the author field with the username, and sort by creation date
    const hoots = await Hoot.find({})
      .populate("author", "username")
      .sort({ createdAt: "desc" });

    res.status(200).json(hoots);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// @route   GET /hoots/:hootId
// @desc    Get a single hoot by ID
router.get("/:hootId", async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId)
      .populate("author", "username")
      .populate("comments.author", "username");

    if (!hoot) {
      return res.status(404).json({ error: "Hoot not found" });
    }

    res.status(200).json(hoot);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   PUT /hoots/:hootId
// @desc    Update a hoot
router.put("/:hootId", async (req, res) => {
  try {
    console.log("Request Body:", req.body);
    console.log("Hoot ID:", req.params.hootId);

    const hoot = await Hoot.findById(req.params.hootId);

    if (!hoot) {
      console.log("Hoot not found");
      return res.status(404).json({ error: "Hoot not found" });
    }

    // Check if the logged-in user is the author
    if (hoot.author.toString() !== req.user._id.toString()) {
      console.log("Unauthorized action");
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Update the hoot with the new data
    hoot.title = req.body.title || hoot.title;
    hoot.text = req.body.text || hoot.text;
    hoot.category = req.body.category || hoot.category;
    hoot.content = req.body.content || hoot.content;

    await hoot.save();
    console.log("Hoot updated successfully");

    res.status(200).json(hoot);
  } catch (error) {
    console.log("Server Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

// @route   DELETE /hoots/:hootId
// @desc    Delete a hoot
router.delete("/:hootId", async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    if (!hoot) {
      return res.status(404).json({ error: "Hoot not found" });
    }

    // Check if the logged-in user is the author
    if (hoot.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    await Hoot.findByIdAndDelete(req.params.hootId);

    res.status(200).json({ message: "Hoot deleted successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// @route   POST /hoots/:hootId/comments
// @desc    Add a comment to a hoot
router.post("/:hootId/comments", async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    if (!hoot) {
      return res.status(404).json({ error: "Hoot not found" });
    }

    const comment = {
      text: req.body.text,
      author: req.user._id, // The comment author's ID
    };

    hoot.comments.push(comment);
    await hoot.save();

    res.status(201).json(hoot); // Return the updated hoot with the new comment
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
