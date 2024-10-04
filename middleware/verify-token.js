const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const token = req.header('Authorization')?.split(' ')[1];  // Extract Bearer token
  if (!token) return res.status(401).json({ error: 'Access denied, token missing!' });

  try {
    const verifiedUser = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verifiedUser;  // Attach user info to the request
    next();  // Proceed to the next middleware/route handler
  } catch (error) {
    res.status(400).json({ error: 'Invalid token!' });
  }
}

module.exports = verifyToken;

