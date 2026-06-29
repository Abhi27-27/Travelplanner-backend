# Travel Planner Platform - Backend (API)

Express API for an AI travel planner. It takes a destination and a few preferences,
asks a large language model to build a day-by-day itinerary, returns it as JSON, and
lets a logged-in user save and re-open their trips. Authentication is JWT based and
data is stored in MongoDB.

This is the backend repo. The React frontend lives in a separate repository.

## Tech stack

- Node.js with Express 5
- MongoDB with Mongoose
- Groq (Llama 3.3 70B) through the OpenAI SDK, which works because Groq exposes an
  OpenAI compatible endpoint
- JSON Web Tokens for auth, bcryptjs for password hashing
- dotenv, cors

## How it works

The itinerary generation is a single request that flows like this:

```
client sends destination, days, budget, interests  (with a JWT)
        -> POST /api/planner/generate
        -> the controller builds a prompt and calls the model on Groq
        -> the model replies with the itinerary as JSON text
        -> the controller cleans and parses the text
        -> the parsed itinerary is sent back to the client
```

A few details worth knowing:

The model is told to behave as a JSON only API and is given the exact shape to
return (a list of days, each with activities that have a time, a place and a
description). If the model still wraps its reply in markdown code fences, the
controller strips them before parsing. This keeps the output usable instead of free
text.

Saving a trip is a normal database write. The trip is tied to the user id taken from
their token, so the "my trips" endpoint can return only that user's trips.

## Project structure

```
backend/
  server.js                  Express app, CORS, route mounting, DB connect
  config/
    db.js                    Mongoose connection
  models/
    User.js                  name, email, password (hashed on save)
    Trip.js                  user, destination, days, budget, interests, itineraryData
  controllers/
    authController.js        register and login
    plannerController.js     generateTrip, saveTrip, getSavedTrips
  middleware/
    authMiddleware.js        protect: verifies the JWT and attaches the user
  routes/
    authRoutes.js            /register, /login
    plannerRoutes.js         /generate, /save, /saved   (all require a token)
  utils/
    generateToken.js         signs a 30 day JWT
  scripts/
    seedTrips.js             bulk-inserts sample trips to test persistence
```

## API routes

Auth (public):

```
POST /api/auth/register      create an account, returns a token
POST /api/auth/login         log in, returns a token
```

Planner (token required, sent as Authorization: Bearer <token>):

```
POST /api/planner/generate   generate an itinerary for the given inputs
POST /api/planner/save       save a generated trip to the user's account
GET  /api/planner/saved      list the logged-in user's saved trips
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- A MongoDB database (local or a free Atlas cluster)
- A Groq API key from console.groq.com

### Install and run

```bash
npm install
npm run dev
```

The server starts on the port set in the environment (3001 by default).

### Environment variables

Create a `.env` file in the backend root:

```env
PORT=3001
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
OPENAI_API_KEY=your_groq_api_key
```

Note: the variable is named OPENAI_API_KEY because the code uses the OpenAI SDK, but
the value is a Groq key. The SDK's base URL is pointed at Groq.

## Seed script

`scripts/seedTrips.js` inserts a batch of sample trips and then reads them back to
confirm they were stored correctly. It was used to check that the Trip schema and the
database work reliably before building the rest of the app on top of them.

Run it from the backend root:

```bash
node scripts/seedTrips.js          # insert sample trips and verify the count
node scripts/seedTrips.js --clean  # remove the sample trips and the seed user
```

It reads MONGO_URI from `.env`, so no credentials are written into the file.

## Deployment

The backend runs on any Node host such as Render or Railway. Set the same
environment variables there, point MONGO_URI at your hosted database, and allow the
frontend's URL in the CORS configuration in `server.js`.