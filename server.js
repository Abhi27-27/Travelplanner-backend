import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import plannerRoutes from './routes/plannerRoutes.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

connectDB(); 

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
   origin: [
        'http://localhost:5173', 
        'https://travelplanner-one-phi.vercel.app' 
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).send('OK');
});

app.use('/api/planner', plannerRoutes);
app.use('/api/auth', authRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔗 MVC Architecture Initialized`);
});