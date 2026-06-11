import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';

// Function: registerUser
export const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // 1. Check if the user already exists in the database
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // 2. Create the new user (Password hashing happens automatically in the Model!)
        const user = await User.create({
            name,
            email,
            password,
        });

        // 3. Send success response back to React with the JWT token
        if (user) {
            res.status(201).json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id), // Hands them their login ticket
            });
        } else {
            res.status(400).json({ message: "Invalid user data" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error during registration", error: error.message });
    }
};

// Function: loginUser
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // 1. Find the user by their email
        const user = await User.findOne({ email });

        // 2. If user exists AND the password matches (using the method we wrote in the Model)
        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                token: generateToken(user._id), // Hands them a fresh login ticket
            });
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    } catch (error) {
        res.status(500).json({ message: "Server error during login", error: error.message });
    }
};