/**
 * seedTrips.js — scripted bulk-insert to validate Trip persistence.
 *
 * What it does:
 *   1. Connects to MongoDB (uses MONGO_URI from your .env).
 *   2. Finds or creates a dedicated seed user to own the trips.
 *   3. Bulk-inserts 60 Trip documents (insertMany) shaped exactly like the app's
 *      generated itineraries.
 *   4. Reads them back and confirms the count — proving reliable persistence.
 *
 * Usage (run from the backend project root):
 *   node scripts/seedTrips.js          # insert 60 trips and verify
 *   node scripts/seedTrips.js --clean  # remove all seed trips + the seed user
 *
 * Note: no secrets are hard-coded here; it reads MONGO_URI from .env, which is
 * gitignored, so this file is safe to commit.
 */

import dotenv from 'dotenv';
import mongoose from 'mongoose';
import User from '../models/User.js';
import Trip from '../models/Trip.js';

dotenv.config();

const SEED_USER = {
  name: 'Seed Tester',
  email: 'seed.tester@voyago.test',
  password: 'SeedTest@123',
};

const DESTINATIONS = [
  'Paris', 'Tokyo', 'Rome', 'Bali', 'New York', 'London', 'Dubai', 'Singapore',
  'Bangkok', 'Istanbul', 'Barcelona', 'Cairo', 'Sydney', 'Cape Town', 'Lisbon',
  'Amsterdam', 'Prague', 'Vienna', 'Goa', 'Jaipur', 'Kyoto', 'Venice', 'Athens',
  'Seoul', 'Marrakech', 'Reykjavik', 'Queenstown', 'Hanoi', 'Zurich', 'Munich',
];
const BUDGETS = ['Backpacker', 'Medium', 'Luxury'];
const INTERESTS = [
  'History & Culture', 'Food & Nightlife', 'Nature & Adventure',
  'Art & Museums', 'Beaches & Relaxation', 'Shopping & City Life',
];
const TIMES = ['09:00 AM', '12:30 PM', '03:00 PM', '07:00 PM'];

// Build an itinerary array shaped like the AI output: [{ day, activities:[{time, place, description}] }]
function buildItinerary(destination, days) {
  const itinerary = [];
  for (let d = 1; d <= days; d++) {
    const activities = TIMES.map((time, i) => ({
      time,
      place: `${destination} highlight ${d}.${i + 1}`,
      description: `Explore a popular spot in ${destination} on day ${d}.`,
    }));
    itinerary.push({ day: d, activities });
  }
  return itinerary;
}

const pick = (arr, i) => arr[i % arr.length];

async function run() {
  const clean = process.argv.includes('--clean');

  if (!process.env.MONGO_URI) {
    console.error('🔴 MONGO_URI is not set. Add it to your .env file.');
    process.exit(1);
  }

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`🟢 Connected: ${mongoose.connection.host}`);

  // Ensure the seed user exists
  let user = await User.findOne({ email: SEED_USER.email });
  if (!user) {
    user = await User.create(SEED_USER);
    console.log(`👤 Created seed user: ${user.email}`);
  } else {
    console.log(`👤 Using existing seed user: ${user.email}`);
  }

  if (clean) {
    const del = await Trip.deleteMany({ user: user._id });
    await User.deleteOne({ _id: user._id });
    console.log(`🧹 Removed ${del.deletedCount} seed trips and the seed user. Done.`);
    await mongoose.disconnect();
    return;
  }

  // Build 60 trip documents
  const COUNT = 60;
  const docs = Array.from({ length: COUNT }, (_, i) => {
    const destination = pick(DESTINATIONS, i);
    const days = (i % 14) + 1; // 1..14, matching the app's slider range
    return {
      user: user._id,
      destination,
      days,
      budget: pick(BUDGETS, i),
      interests: pick(INTERESTS, i),
      itineraryData: buildItinerary(destination, days),
    };
  });

  const inserted = await Trip.insertMany(docs);
  console.log(`✅ Inserted ${inserted.length} trips.`);

  // Read back to confirm reliable persistence
  const persisted = await Trip.countDocuments({ user: user._id });
  console.log(`🔎 Verified: ${persisted} trips now persisted for the seed user.`);
  console.log(persisted >= COUNT ? '🎉 Persistence check PASSED.' : '⚠️ Count mismatch.');

  await mongoose.disconnect();
  console.log('🔌 Disconnected.');
}

run().catch(async (err) => {
  console.error('🔴 Seed failed:', err.message);
  await mongoose.disconnect();
  process.exit(1);
});