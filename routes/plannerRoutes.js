import express from 'express';

import { generateTrip, saveTrip, getSavedTrips } from '../controllers/plannerController.js';

import { protect } from '../middleware/authMiddleware.js'; 

const router = express.Router();

router.post('/generate', protect, generateTrip);

router.post('/save', protect, saveTrip);

router.get('/saved', protect, getSavedTrips);

export default router;