import { Router } from 'express';
import Article from '../models/Article.js';
import fetch from 'node-fetch';
import { mockArticles } from '../data/mockArticles.js';

const router = Router();

// In-memory cache (15-minute TTL)
let cached = { at: 0, data: [] };

/** Classify a headline + summary into a category */
const classify = (text) => {
  if (/market|stock|bank|rupee|fund|invest/i.test(text)) return 'Markets';
  if (/science|space|climate|research|telescope/i.test(text)) return 'Science';
  if (/startup|founder|venture|saas/i.test(text)) return 'Startup';
  return 'AI & Tech';
};

/** Fetch stories from NewsAPI → MongoDB → mock fallback */
async function getStories() {
  // Return cached data if still fresh (15 min)
  if (Date.now() - cached.at < 900_000) return cached.data;

  let data = [];

  // Try NewsAPI first
  if (process.env.NEWS_API_KEY) {
    try {
      const params = new URLSearchParams({
        q: 'artificial intelligence OR technology OR startup OR markets OR science',
        language: 'en',
        sortBy: 'publishedAt',
        pageSize: '50',
        apiKey: process.env.NEWS_API_KEY,
      });

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 7000);

      const response = await fetch(
        `https://newsapi.org/v2/everything?${params}`,
        { signal: controller.signal }
      );
      clearTimeout(timeout);

      const payload = await response.json();

      if (payload.status === 'ok') {
        data = payload.articles
          .filter((a) => a.title && a.description && a.url)
          .map((a, index) => ({
            _id: `live-${index}`,
            headline: a.title.replace(/\s+-\s+[^-]+$/, ''),
            summary: a.description,
            source: a.source?.name || 'News',
            category: classify(`${a.title} ${a.description}`),
            url: a.url,
            publishedAt: a.publishedAt,
          }));
      }
    } catch {
      console.warn('NewsAPI unavailable; serving local briefing.');
    }
  }

  // Fallback to MongoDB
  if (!data.length) {
    data = await Article.find().sort({ publishedAt: -1 }).lean();
  }

  // Final fallback to hardcoded mock data
  if (!data.length) {
    data = mockArticles;
  }

  cached = { at: Date.now(), data };
  return data;
}

// ── GET /feed ──
router.get('/feed', async (req, res, next) => {
  try {
    const data = await getStories();
    const category = req.query.category;
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 30, 1), 50);

    const filtered =
      category && category !== 'All'
        ? data.filter((a) => a.category === category)
        : data;

    res.json(filtered.slice(0, limit));
  } catch (e) {
    next(e);
  }
});

export default router;
