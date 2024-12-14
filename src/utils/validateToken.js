import jwt from 'jsonwebtoken';

const JWT_KEY = process.env.JWT_SECRET;

export function validateToken(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ error: 'Authorization header is missing.' });
    }

    const token = authHeader.split(' ')[1]; // Expect "Bearer <token>"

    try {
        const decoded = jwt.verify(token, JWT_KEY);
        req.user = decoded; // Attach decoded token to the request for further use
        next(); // Token is valid, proceed to the next middleware or handler
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired. Please log in again.' });
        }
        return res.status(401).json({ error: 'Invalid token. Authorization denied.' });
    }
}