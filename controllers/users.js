const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Hoot = require('../models/hoot');

const SALT_LENGTH = 12;

// Helper function to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    { username: user.username, _id: user._id },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } // Token expires in 1 hour (adjust as necessary)
  );
};

// Sign-up route
router.post("/signup", async (req, res) => {
  try {
    // Check if the username already exists
    const userInDatabase = await User.findOne({ username: req.body.username });
    if (userInDatabase) {
      return res.status(400).json({ error: "Username already taken." });
    }

    // Create a new user with a hashed password
    const hashedPassword = bcrypt.hashSync(req.body.password, SALT_LENGTH);
    const user = await User.create({
      username: req.body.username,
      hashedPassword: hashedPassword,
    });

    const token = generateToken(user);
    res.status(201).json({ user, token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Sign-in route
router.post("/signin", async (req, res) => {
  try {
    // Find the user by username
    const user = await User.findOne({ username: req.body.username });

    // Check if the user exists and the password matches
    if (user && bcrypt.compareSync(req.body.password, user.hashedPassword)) {
      const token = generateToken(user);
      res.status(200).json({ token });
    } else {
      res.status(401).json({ error: "Invalid username or password." });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Get all users (admin-protected, or for general use)
router.get("/", async (req, res) => {
  try {
    const users = await User.find({}, "username _id createdAt");
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user info
router.put("/:userId", async (req, res) => {
  try {
    // Find user by ID
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Update fields (you can add or modify based on what you allow to update)
    user.username = req.body.username || user.username;

    // If updating password, hash the new one
    if (req.body.password) {
      user.hashedPassword = bcrypt.hashSync(req.body.password, SALT_LENGTH);
    }

    await user.save();
    res.status(200).json(user); // Return the updated user info
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete user
router.delete("/:userId", async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
