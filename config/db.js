import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        // We tell Mongoose to connect using the hidden URL from our .env file
        const conn = await mongoose.connect(process.env.MONGO_URI);
        
        // If successful, log the host name to the terminal
        console.log(`🟢 MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        // If it fails (wrong password, bad internet), print the error and kill the server
        console.error(`🔴 MongoDB Connection Error: ${error.message}`);
        process.exit(1); 
    }
};

export default connectDB;