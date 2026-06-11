import OpenAI from "openai";
import 'dotenv/config';
import Trip from '../models/Trip.js';

// 1. Initialize the Groq client using the OpenAI SDK format
const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY, // Updated to use the standard OPENAI_API_KEY format
    baseURL: "https://api.groq.com/openai/v1",
});

export const generateTrip = async (req, res) => {
    try {
        const { destination, days, budget, interests } = req.body;
        
        console.log(`[AI Sync] Generating a ${days}-day trip to ${destination} for user: ${req.user?.name || 'Guest'}`);

        // 2. Craft the strict prompt instructions
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

        // 3. Execute the request using Groq's chat completion endpoint
        const response = await client.chat.completions.create({
            model: "llama-3.3-70b-versatile", // Groq's fast Llama 3 model
            messages: [
                { role: "system", content: "You are a JSON-only API. You output raw valid JSON arrays and nothing else." },
                { role: "user", content: prompt }
            ],
            temperature: 0.7, // Adds a bit of creativity while keeping structure
        });

        // 4. Parse the AI's string response into true JSON data
        let rawText = response.choices[0].message.content;
        
        // Safety measure: Clean up any markdown formatting if the AI disobeys
        if (rawText.includes('```')) {
            rawText = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
        }

        const cleanedJsonData = JSON.parse(rawText);

        // 5. Return the perfectly structured itinerary back to your React View
        res.status(200).json({
            success: true,
            itinerary: cleanedJsonData
        });

    } catch (error) {
        console.error("🔴 Groq API Error:", error);
        res.status(500).json({ 
            success: false, 
            error: "The AI agent failed to compose your itinerary. Please verify your API configuration." 
        });
    }
};

// --- Save a generated trip to the database ---
export const saveTrip = async (req, res) => {
    try {
        const { destination, days, budget, interests, itineraryData } = req.body;

        const newTrip = new Trip({
            user: req.user.id, 
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

// --- Fetch all saved trips for the logged-in user ---
export const getSavedTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json(trips);
        
    } catch (error) {
        console.error("🔴 Error fetching trips:", error);
        res.status(500).json({ error: "Failed to fetch your saved trips." });
    }
};