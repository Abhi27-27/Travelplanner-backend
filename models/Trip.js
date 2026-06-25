import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', 
    required: true
  },
  destination: { type: String, required: true },
  days: { type: Number, required: true },
  budget: { type: String },
  interests: { type: String },
  itineraryData: { type: Array, required: true }, 
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Trip', tripSchema);