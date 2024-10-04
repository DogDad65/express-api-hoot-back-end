const express = require("express");
const router = express.Router();
const User = require("../models/user");
const verifyToken = require("../middleware/verify-token");

// Protected route to get a user's profile
router.get('/:userId', verifyToken, async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      if (!user) {
        return res.status(404).json({ error: 'Profile not found.' });
      }

      res.json({ user });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
