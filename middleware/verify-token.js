const jwt = require("jsonwebtoken");

function verifyToken(req, res, next) {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Extract the token from the Authorization header
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token using JWT secret
    req.user = decoded; // Store the decoded token payload (user data) in req.user
    next(); // Move to the next middleware/route handler
  } catch (error) {
    res.status(401).json({ error: "Invalid token." }); // Respond with a 401 error for invalid token
  }
}

module.exports = verifyToken;
