# Nuzio AI

Personalised audio news for Indian professionals — curated every morning.

Built with **React 18**, **Express 4**, **MongoDB**, and the **Web Speech API**.

---

## Features

- 🎧 **Audio narration** — articles are read aloud using the browser's Speech Synthesis API
- 🔐 **Authentication** — email/password registration & login with JWT (access + refresh tokens)
- 🔑 **Google sign-in** — One Tap via Google Identity Services
- 📰 **Live news** — pulls headlines from NewsAPI (falls back to seeded data offline)
- 🎛 **Category filtering** — All, AI & Tech, Markets, Startup, Science
- 📱 **Responsive** — optimised for mobile, tablet, and laptop screens
- 🛡 **Security** — rate-limited auth, CORS, security headers, bcrypt password hashing

---

## Tech Stack

| Layer      | Technology                                    |
| ---------- | --------------------------------------------- |
| Frontend   | React 18, Vite 8, Lucide icons, Tailwind CSS  |
| Backend    | Node.js 18+, Express 4, Mongoose              |
| Database   | MongoDB (local or Atlas)                       |
| Auth       | JWT, bcryptjs, Google Auth Library             |
| Narration  | Web Speech API (SpeechSynthesis)               |

---

## Project Structure

```
Nuzio AI/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── api/            # API client with token refresh
│   │   ├── components/     # Logo, Player, Waveform
│   │   ├── context/        # PlayerContext (speech + queue)
│   │   ├── pages/          # Login, Feed
│   │   ├── styles.css      # Global styles
│   │   ├── brief.css       # Feed page styles
│   │   └── brief-done.css  # Brief-complete banner
│   ├── .env.example
│   └── vite.config.js
├── server/                 # Express API
│   ├── controllers/        # authController
│   ├── middleware/          # JWT auth middleware
│   ├── models/             # User, Article (Mongoose)
│   ├── routes/             # auth, news, user
│   ├── data/               # mockArticles fallback
│   ├── seed.js             # Database seeder
│   ├── .env.example
│   └── index.js
├── .gitignore
└── README.md
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** — local install or [MongoDB Atlas](https://www.mongodb.com/atlas) (free tier works)

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/nuzio-ai.git
cd nuzio-ai
```

### 2. Set up the server

```bash
cd server
cp .env.example .env
```

Edit `server/.env` and configure:

| Variable              | Required | Description                                      |
| --------------------- | -------- | ------------------------------------------------ |
| `MONGODB_URI`         | ✅       | MongoDB connection string                         |
| `JWT_SECRET`          | ✅       | Long random string (≥ 32 chars)                   |
| `NEWS_API_KEY`        | Optional | [NewsAPI](https://newsapi.org) key for live news  |
| `GOOGLE_CLIENT_ID`    | Optional | Google OAuth client ID                            |
| `GOOGLE_CLIENT_SECRET`| Optional | Google OAuth client secret                        |
| `CLIENT_ORIGIN`       | ✅       | Frontend URL (default: `http://localhost:5173`)    |
| `NODE_ENV`            | ✅       | `development` or `production`                     |

Then install and seed:

```bash
npm install
npm run seed    # seeds 3 demo users + 21 articles
npm run dev     # starts with nodemon (auto-reload)
```

### 3. Set up the client

```bash
cd ../client
cp .env.example .env
```

Edit `client/.env`:

| Variable               | Required | Description                     |
| ---------------------- | -------- | ------------------------------- |
| `VITE_API_URL`         | ✅       | API base URL (default: `http://localhost:5000/api`) |
| `VITE_GOOGLE_CLIENT_ID`| Optional | Same Google client ID as server |

Then install and run:

```bash
npm install
npm run dev
```

### 4. Open the app

Visit **http://localhost:5173**, create an account, and play a story.

---

## Deployment

### Option A: Render (recommended for beginners)

**Server (Web Service):**
1. Create a new **Web Service** on [render.com](https://render.com)
2. Connect your GitHub repo
3. Set **Root Directory** to `server`
4. **Build Command:** `npm install`
5. **Start Command:** `npm start`
6. Add all environment variables from `server/.env.example`
7. Set `NODE_ENV=production` and `CLIENT_ORIGIN` to your frontend URL

**Client (Static Site):**
1. Create a new **Static Site** on Render
2. Connect the same repo
3. Set **Root Directory** to `client`
4. **Build Command:** `npm install && npm run build`
5. **Publish Directory:** `dist`
6. Add environment variables: `VITE_API_URL=https://your-server.onrender.com/api`

**Database:**
- Use [MongoDB Atlas](https://www.mongodb.com/atlas) (free M0 cluster)
- Whitelist Render's IPs (or `0.0.0.0/0` for simplicity)
- Put the Atlas connection string in `MONGODB_URI`

### Option B: Vercel (client) + Railway (server)

**Client on Vercel:**
1. Import repo on [vercel.com](https://vercel.com)
2. Set **Root Directory** to `client`
3. Framework preset: **Vite**
4. Add `VITE_API_URL` env var pointing to your Railway backend

**Server on Railway:**
1. Create a new project on [railway.app](https://railway.app)
2. Set **Root Directory** to `server`
3. Add all env vars
4. Railway auto-detects `npm start`

### Option C: VPS / Self-hosted

```bash
# On the server
git clone https://github.com/YOUR_USERNAME/nuzio-ai.git
cd nuzio-ai

# Server
cd server
cp .env.example .env
# Edit .env with production values
npm install --omit=dev
npm run seed
npm start          # or use pm2: pm2 start index.js --name nuzio-api

# Client
cd ../client
cp .env.example .env
# Edit .env with production API URL
npm install
npm run build
# Serve dist/ with nginx, caddy, or similar
```

### Production Checklist

- [ ] Set `NODE_ENV=production`
- [ ] Use a strong random `JWT_SECRET` (≥ 48 chars)
- [ ] Set `CLIENT_ORIGIN` to your actual frontend domain
- [ ] Run behind HTTPS (use Cloudflare, Caddy, or nginx with Let's Encrypt)
- [ ] Use MongoDB Atlas or a secured MongoDB instance
- [ ] Never commit `.env` files — use deployment platform's env var settings
- [ ] Google sign-in requires configuring OAuth consent screen + credentials in Google Cloud Console

---

## Demo Credentials (after seeding)

| Email              | Password       |
| ------------------ | -------------- |
| aarav@nuzio.demo   | password123    |
| priya@nuzio.demo   | password123    |
| rohan@nuzio.demo   | password123    |

---

## License

MIT
