import express from 'express';
import { registerUser, loginUser } from '../controllers/authController.js';

const router = express.Router();

// Route: POST /api/auth/register
// Purpose: Create a new account
router.post('/register', registerUser);

// Route: POST /api/auth/login
// Purpose: Log into an existing account
router.post('/login', loginUser);

export default router;