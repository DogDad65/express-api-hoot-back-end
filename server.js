const express = require("express");
const cors = require("cors");  // Import CORS
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const app = express();

// Middleware to parse JSON
app.use(express.json());

// Enable CORS to allow requests from your frontend
app.use(cors({
  origin: "http://localhost:5173"  // Replace with your frontend's URL
}));

// Routes
const usersRouter = require("./controllers/users");
const profilesRouter = require("./controllers/profiles");
const hootsRouter = require('./controllers/hoots.js');

app.use("/users", usersRouter);
app.use("/profiles", profilesRouter);
app.use('/hoots', hootsRouter);

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI);


mongoose.connection.on("connected", () => {
  console.log(`Connected to MongoDB ${mongoose.connection.name}.`);
});

// Start the server
app.listen(3000, () => {
  console.log("The express app is running on port 3000.");
});
