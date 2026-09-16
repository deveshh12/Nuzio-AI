import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import auth from './routes/auth.js';
import news from './routes/news.js';
import user from './routes/user.js';
import { requireAuth } from './middleware/auth.js';

const app = express();
const port = Number(process.env.PORT) || 5000;

const allowedOrigins = (
  process.env.CLIENT_ORIGIN || 'http://localhost:5173,http://127.0.0.1:5173'
).split(',');

// ── Security headers ──
app.disable('x-powered-by');
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// ── CORS ──
app.use(
  cors({
    origin: (origin, done) =>
      !origin || allowedOrigins.includes(origin)
        ? done(null, true)
        : done(new Error('Origin not allowed')),
  })
);

// ── Body parser ──
app.use(express.json({ limit: '32kb' }));

// ── Routes ──
app.get('/api/health', (req, res) =>
  res.json({ ok: true, database: mongoose.connection.readyState === 1 })
);

app.use('/api/auth', auth);
app.use('/api/news', requireAuth, news);
app.use('/api/user', requireAuth, user);

// ── 404 fallback ──
app.use((req, res) =>
  res.status(404).json({ message: 'Route not found.' })
);

// ── Error handler ──
app.use((error, req, res, _next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || 'Something went wrong.',
  });
});

// ── Startup ──
if (!process.env.MONGODB_URI || !process.env.JWT_SECRET) {
  throw new Error('MONGODB_URI and JWT_SECRET must be configured.');
}

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => app.listen(port, () => console.log(`Nuzio API ready on :${port}`)))
  .catch((error) => {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  });
