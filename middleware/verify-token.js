const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
	try {
		// Check if the Authorization header is present
		const authHeader = req.headers.authorization;
		if (!authHeader) {
			return res.status(401).json({ error: 'No authorization token provided.' });
		}

		// Check if the token follows the "Bearer <token>" format
		const token = authHeader.split(' ')[1];
		if (!token) {
			return res.status(401).json({ error: 'Malformed authorization token.' });
		}

		// Verify the token and assign the decoded payload to req.user
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		req.user = decoded;

		// Call next() to invoke the next middleware function
		next();
	} catch (error) {
		// If verification fails, return a 401 status and error message
		return res.status(401).json({ error: 'Invalid authorization token.' });
	}
}

module.exports = verifyToken;
