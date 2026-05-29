# AquaSense

Real-time water safety and quantity monitoring for Kenyan citizens, powered by Sentinel-2 satellite imagery and AI analysis. Built at Build Zero Nairobi, May 30 2026.

---

## Prerequisites

| Tool | Version | Install |
|------|---------|---------|
| Node.js | 18+ | https://nodejs.org |
| npm | 9+ | bundled with Node |
| Python | 3.11+ | https://python.org |
| Expo Go | latest | App Store / Play Store |
| ngrok | latest | https://ngrok.com |

---

## Project Structure

```
AquaSense/
├── frontend/   React Native app (Expo Router)
├── backend/    Python FastAPI server
└── README.md
```

---

## Frontend Setup

```bash
cd frontend
npm install
npx expo start
```

Scan the QR code with **Expo Go** on your phone.

**Environment variable:**
Create `frontend/.env` and set:
```
EXPO_PUBLIC_API_URL=http://localhost:8000
```
On demo day, replace with your ngrok URL:
```
EXPO_PUBLIC_API_URL=https://your-ngrok-subdomain.ngrok-free.app
```

---

## Backend Setup

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
copy .env.example .env       # Windows
# cp .env.example .env       # macOS/Linux
# → Fill in API keys in .env

# Seed demo data (required before first run)
python -m app.seeds.nairobi_seed

# Start server
uvicorn app.main:app --reload --port 8000
```

API docs available at: **http://localhost:8000/docs**

---

## Exposing Backend via ngrok (Demo Day)

```bash
ngrok http 8000
```

Copy the `https://` URL into `frontend/.env` as `EXPO_PUBLIC_API_URL`.

---

## Environment Variables

See `backend/.env.example` for all required variables:

| Variable | Description |
|----------|-------------|
| `SENTINEL_HUB_CLIENT_ID` | Sentinel Hub OAuth2 client ID |
| `SENTINEL_HUB_CLIENT_SECRET` | Sentinel Hub OAuth2 client secret |
| `GROQ_API_KEY_1` | Primary Groq API key |
| `GROQ_API_KEY_2` | Fallback Groq API key (rate limit rotation) |
| `OPENAQ_API_KEY` | OpenAQ API key (optional) |
| `ADMIN_API_KEY` | Protects POST /sources/{id}/refresh |

---

## Team

| Name | Role | Focus |
|------|------|-------|
| Ralph | Frontend / React Native | UI screens, components, design |
| Alex | Mobile / React Native | State, navigation, API integration |
| Moses | Backend | FastAPI, database, data pipeline |
| Alvin | AI / Backend + Lead | Groq/Llama 3, integration, demo |
