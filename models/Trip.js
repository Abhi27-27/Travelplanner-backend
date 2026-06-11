import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Links this trip securely to the logged-in user
    required: true
  },
  destination: { type: String, required: true },
  days: { type: Number, required: true },
  budget: { type: String },
  interests: { type: String },
  itineraryData: { type: Array, required: true }, // The AI JSON array
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Trip', tripSchema);