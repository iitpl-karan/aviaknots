const jwt = require('jsonwebtoken'); // Install using: npm install jsonwebtoken

// Middleware to authenticate users
const authenticateUser = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    try {
        // Verify the token using your secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach the decoded token payload to the req object
        next(); // Pass control to the next middleware or route handler
    } catch (err) {
        console.error('Invalid token:', err.message);
        res.status(401).json({ message: 'Invalid token. Authentication failed.' });
    }
};

module.exports = authenticateUser;
