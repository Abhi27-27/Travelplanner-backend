import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // 1. Extract the token from the header
            token = req.headers.authorization.split(' ')[1];

            // 2. Verify the token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // 3. Find the user and attach them to the request
            req.user = await User.findById(decoded.id).select('-password');
            next();
            
        } catch (error) {
            console.error("🔴 Token Verification Failed:", error.message);
            // If the token is malformed or expired, send a 401 Unauthorized securely
            return res.status(401).json({ error: "Not authorized, invalid token." });
        }
    }

    if (!token) {
        return res.status(401).json({ error: "Not authorized, no token provided." });
    }
};