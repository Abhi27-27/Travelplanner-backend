import express from 'express';
// 1. Import the new saveTrip and getSavedTrips functions
import { generateTrip, saveTrip, getSavedTrips } from '../controllers/plannerController.js';

// Import your authentication middleware (adjust path/name if yours is different)
import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

// Existing generation route
router.post('/generate', protect, generateTrip);

// 2. New route to SAVE a trip (Protected)
router.post('/save', protect, saveTrip);

// 3. New route to GET all saved trips (Protected)
router.get('/saved', protect, getSavedTrips);

export default router;