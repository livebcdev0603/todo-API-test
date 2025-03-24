const jwt = require('jsonwebtoken');
require('dotenv').config();

const authMiddleware = (req, res, next) => {
    // Get token from header
    const authHeader = req.headers.authorization;

    if(!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(" ")[1];

    // Add additional validation for token format
    if (!token || token.trim() === '') {
        return res.status(401).json({ message: "invalid token format" });
    }

    // Check if token has a valid JWT structure
    if(!token.match(/^[A-Za-z0-9-_]+(\.[A-Za-z0-9-_]+){2}$/)) {
        return res.status(401).json({ message: "Invalid token" });
    }

    try {
        //Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');

        //Add user Id to request
        req.userId = decoded.id;

        next();
    } catch(error) {
        console.error('Token verification failed: ', error);
        console.error('Token that failed verification: ', token);
        return res.status(401).json({message: 'Invalid token'});
    }
}

module.exports = authMiddleware;