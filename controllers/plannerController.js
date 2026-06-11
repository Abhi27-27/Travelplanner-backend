import { GoogleGenerativeAI } from '@google/generative-ai';
import Trip from '../models/Trip.js';
// 1. Initialize the Google Gemini SDK with your hidden API key
const ai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export const generateTrip = async (req, res) => {
    try {
        const { destination, days, budget, interests } = req.body;
        
        console.log(`[AI Sync] Generating a ${days}-day trip to ${destination} for user: ${req.user.name}`);

        // 2. Select the model and force it to output JSON
        const model = ai.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    generationConfig: { responseMimeType: "application/json" }
});

        // 3. Craft the strict prompt instructions
        const prompt = `
            You are an expert travel planner. Generate a highly personalized day-by-day travel itinerary for a trip to ${destination}.
            
            Trip Parameters:
            - Duration: ${days} days
            - Budget Style: ${budget}
            - Specific traveler interests or notes: ${interests || 'None specified'}
            
            CRITICAL REQUIREMENT: You must respond ONLY with a raw JSON array matching the schema below. Do not include markdown formatting, do not write 'json\`\`\`', and do not add any conversational intro or outro text.
            
            Required Output Schema Format:
            [
              {
                "day": 1,
                "activities": [
                  { "time": "09:00 AM", "place": "Name of Place", "description": "Brief description of what to do there." }
                ]
              }
            ]
        `;

        // 4. Execute the request
        const result = await model.generateContent(prompt);

        // 5. Parse the AI's string response into true JSON data
        const rawText = result.response.text();
        const cleanedJsonData = JSON.parse(rawText);

        // 6. Return the perfectly structured itinerary back to your React View
        res.status(200).json({
            success: true,
            itinerary: cleanedJsonData
        });

    } catch (error) {
        console.error("🔴 Gemini API Error:", error);
        res.status(500).json({ 
            success: false, 
            error: "The AI agent failed to compose your itinerary. Please verify your API configuration." 
        });
    }
};
// --- NEW: Save a generated trip to the database ---
export const saveTrip = async (req, res) => {
    try {
        const { destination, days, budget, interests, itineraryData } = req.body;

        // Create a new trip linked to the user's ID (provided by authMiddleware)
        const newTrip = new Trip({
            user: req.user.id, // Note: if your middleware uses req.user._id, change this to req.user._id
            destination,
            days,
            budget,
            interests,
            itineraryData
        });

        const savedTrip = await newTrip.save();
        res.status(201).json({ message: "Trip saved successfully!", trip: savedTrip });
        
    } catch (error) {
        console.error("🔴 Error saving trip:", error);
        res.status(500).json({ error: "Failed to save the trip to the database." });
    }
};

// --- NEW: Fetch all saved trips for the logged-in user ---
export const getSavedTrips = async (req, res) => {
    try {
        // Find all trips matching the user's ID, sorted by newest first (-1)
        const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(trips);
        
    } catch (error) {
        console.error("🔴 Error fetching trips:", error);
        res.status(500).json({ error: "Failed to fetch your saved trips." });
    }
};