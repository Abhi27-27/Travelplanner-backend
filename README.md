# ⚙️ AI Travel Planner (Backend)

<div align="center">

![Voyago](https://img.shields.io/badge/Voyago-Travel_AI-4f46e5?style=for-the-badge&logo=node.js&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-18-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-4-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Groq](https://img.shields.io/badge/Groq-Llama_3-F55036?style=for-the-badge&logo=meta&logoColor=white)

**REST API powering AI itinerary generation, auth, and trip storage**

[🌐 Frontend Live Demo](https://travelplanner-one-phi.vercel.app/) · [💻 Frontend Repo](https://github.com/Abhi27-27/Travelplanner) · [🐛 Report Bug](https://github.com/Abhi27-27/Travelplanner-backend/issues)

</div>

---

## 📌 Overview

This is the **Node.js/Express backend** for AI-powered travel planning platform. It handles user authentication, communicates with the Groq API (Llama 3) to generate personalized itineraries, and persists trips to MongoDB.

---

## 🔗 Frontend

> **Live App:** [https://travelplanner-one-phi.vercel.app/](https://travelplanner-one-phi.vercel.app/)
>
> **Frontend Repository:** [https://github.com/Abhi27-27/Travelplanner](https://github.com/Abhi27-27/Travelplanner)

---

## ✨ Features

- 🤖 **AI Itinerary Generation** — Calls Groq's Llama 3.3-70B model with structured JSON prompts to produce day-by-day travel plans
- 🔐 **JWT Authentication** — Stateless auth with 30-day tokens and bcrypt password hashing
- 💾 **Trip Persistence** — Save generated itineraries linked to authenticated users in MongoDB
- 📚 **Saved Trips API** — Fetch all saved trips for a user, sorted by most recent
- 🛡️ **Route Protection** — `protect` middleware guards all planner and trip endpoints
- 🌐 **CORS Configured** — Explicitly allows both local dev and deployed Vercel frontend

---

## 🛠️ Tech Stack

| Category | Technology |
|---|---|
| Runtime | Node.js 18 (ESM) |
| Framework | Express.js 4 |
| Database | MongoDB + Mongoose |
| AI Provider | Groq API (Llama 3.3-70B) |
| Auth | JWT + bcryptjs |
| Environment | dotenv |

---

## 📁 Project Structure

```
├── server.js                   # Entry point — Express app + server start
├── config/
│   └── db.js                   # MongoDB connection
├── routes/
│   ├── authRoutes.js           # POST /auth/register, /auth/login
│   └── plannerRoutes.js        # POST /planner/generate, /planner/save, GET /planner/saved
├── controllers/
│   ├── authController.js       # Register & login logic
│   └── plannerController.js    # AI generation, save trip, fetch trips
├── middleware/
│   └── authMiddleware.js       # JWT protect guard
├── models/
│   ├── User.js                 # name, email, password (bcrypt hashed)
│   └── Trip.js                 # user ref, destination, days, itineraryData[]
└── utils/
    └── generateToken.js        # JWT sign helper (30d expiry)
```

---

## 🔌 API Reference

### Auth

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/auth/register` | Create a new account | ❌ |
| POST | `/api/auth/login` | Login and receive JWT | ❌ |

**Register body:**
```json
{ "name": "Alex", "email": "alex@example.com", "password": "securepass" }
```

**Login body:**
```json
{ "email": "alex@example.com", "password": "securepass" }
```

**Response (both):**
```json
{ "_id": "...", "name": "Alex", "email": "alex@example.com", "token": "<JWT>" }
```

---

### Planner

| Method | Endpoint | Description | Auth |
|---|---|---|---|
| POST | `/api/planner/generate` | Generate AI itinerary | ✅ |
| POST | `/api/planner/save` | Save itinerary to DB | ✅ |
| GET | `/api/planner/saved` | Fetch all saved trips | ✅ |

**Generate body:**
```json
{
  "destination": "Kyoto, Japan",
  "days": 5,
  "budget": "Medium",
  "interests": "temples, street food, art"
}
```

**Generate response:**
```json
{
  "success": true,
  "itinerary": [
    {
      "day": 1,
      "activities": [
        { "time": "09:00 AM", "place": "Fushimi Inari", "description": "..." }
      ]
    }
  ]
}
```

---

## ⚙️ Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Groq API key — [get one free at console.groq.com](https://console.groq.com)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Abhi27-27/Travelplanner-backend.git
cd Travelplanner-backend

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
```

### Environment Variables

Create a `.env` file in the root:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/voyago
JWT_SECRET=your_super_secret_jwt_key
OPENAI_API_KEY=your_groq_api_key_here
```

> `OPENAI_API_KEY` is used with the Groq base URL (`https://api.groq.com/openai/v1`) via the OpenAI SDK.

### Run Locally

```bash
# Development
npm run dev

# Production
npm start
```

Server runs at `http://localhost:5000`

Health check: `GET /health` → `200 OK`

---

## 🤖 AI Architecture

The planner uses the **OpenAI SDK pointed at Groq's endpoint** to run `llama-3.3-70b-versatile`:

- System prompt enforces **JSON-only output**
- User prompt injects destination, days, budget, and interests
- Response is cleaned of any markdown fences and parsed directly to a structured array
- The same array is returned to the frontend and optionally saved to MongoDB

---

Made by <a href="https://github.com/Abhi27-27">Marreddy Abhiram Muni Reddy</a> · IIT Kharagpur
</div>
