const express = require("express");
const app = express();
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();
const usersRouter = require("./controllers/users");
const profilesRouter = require("./controllers/profiles");

// Middleware to parse JSON
app.use(express.json());

// Routes
app.use("/users", usersRouter);
app.use("/profiles", profilesRouter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);

mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Start the server
app.listen(3000, () => {
  console.log("The express app is running on port 3000.");
});
