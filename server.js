import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import plannerRoutes from './routes/plannerRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

// 1. Establish database connection
connectDB(); 

const app = express();
const PORT = process.env.PORT || 5000;

// 2. EXTRA RIGOROUS CORS SETUP (Must be placed before reading body data or routes)
app.use(cors({
    origin: 'http://localhost:5173', // Your exact frontend application address
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

// 3. Body Parsing Middleware
app.use(express.json());

// 4. Application Routes
app.use('/api/planner', plannerRoutes);
app.use('/api/auth', authRoutes);

// 5. Start Listening
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 MVC Architecture Initialized`);
});