import { useCallback, useEffect, useState } from 'react';
import {
  Bell,
  ExternalLink,
  LogOut,
  Pause,
  Play,
  Search,
  SkipBack,
  SkipForward,
  Compass,
  Settings,
} from 'lucide-react';
import { api } from '../api/client';
import Logo from '../components/Logo';
import Waveform from '../components/Waveform';
import { usePlayer } from '../context/PlayerContext';
import '../brief.css';
import '../brief-done.css';

const categories = ['All', 'AI & Tech', 'Markets', 'Startup', 'Science'];

const greeting = (hour) =>
  hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

export default function Feed({ logout }) {
  const [user] = useState(() =>
    JSON.parse(localStorage.getItem('nuzio_user') || '{"name":"Aarav"}')
  );
  const [articles, setArticles] = useState([]);
  const [category, setCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [now, setNow] = useState(() => new Date());

  const {
    current,
    playing,
    progress,
    briefComplete,
    speak,
    toggle,
    next,
    reset,
    setQueue,
    supported,
  } = usePlayer();

  // ── Load articles ──
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const stories = await api(
        `/news/feed?category=${encodeURIComponent(category)}`
      );
      setArticles(stories);
      setQueue(stories);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [category, setQueue]);

  useEffect(() => { load(); }, [load]);

  // Update clock every minute
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);

  const featured =
    articles.find((a) => a._id === current?._id) || articles[0];
  const currentIndex = Math.max(
    0,
    articles.findIndex((a) => a._id === featured?._id)
  );
  const part = greeting(now.getHours());
  const time = new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(now);

  const startOrToggle = () => (current ? toggle() : speak(featured));

  return (
    <main className="brief-screen">
      {/* ── Header ── */}
      <header className="brief-header">
        <Logo small />
        <div className="head-actions">
          <button aria-label="Search stories">
            <Search size={16} />
          </button>
          <button aria-label="Notifications">
            <Bell size={16} />
            <i />
          </button>
          <button className="out" aria-label="Sign out" onClick={logout}>
            <LogOut size={15} />
          </button>
        </div>
      </header>

      {/* ── Category nav ── */}
      <nav className="category-nav" aria-label="News categories">
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => { reset(); setCategory(item); }}
            className={category === item ? 'selected' : ''}
            aria-pressed={category === item}
          >
            {item}
          </button>
        ))}
      </nav>

      {/* ── Intro ── */}
      <section className="brief-intro">
        <p>YOUR PERSONAL · {part.toUpperCase()} BRIEF · {time}</p>
        <h1>Good {part}, {user.name || 'Aarav'} —</h1>
        <h2>Your {part} brief.</h2>
        <div>
          <b />
          Audio live <span>· Voice: Aria · curated right now</span>
        </div>
      </section>

      {/* ── Featured player ── */}
      {loading ? (
        <div className="featured-skeleton" />
      ) : error ? (
        <div className="feed-error">
          {error}
          <button onClick={load}>Try again</button>
        </div>
      ) : (
        featured && (
          <section className="featured-player">
            <div className="featured-top">
              <span>● &nbsp;NOW PLAYING · {featured.category}</span>
              <small>
                {String(currentIndex + 1).padStart(2, '0')} /{' '}
                {String(articles.length).padStart(2, '0')}
              </small>
            </div>

            <h3>{featured.headline}</h3>

            <div className="featured-meta">
              <a href={featured.url} target="_blank" rel="noreferrer">
                {featured.source} <ExternalLink size={11} />
              </a>
              <span>·</span>
              <time>3 MIN</time>
              <button className="save-story">SAVE</button>
            </div>

            <p>{featured.summary}</p>

            <Waveform active={playing} />

            <div className="player-progress">
              <i style={{ width: `${progress}%` }} />
            </div>
            <div className="time-row">
              <span>00:00</span>
              <span>−03:47</span>
            </div>

            <div className="feature-controls">
              <button aria-label="Previous story" onClick={() => next(-1)}>
                <SkipBack size={17} />
              </button>
              <button
                aria-label={playing ? 'Pause narration' : 'Play narration'}
                className="feature-play"
                onClick={startOrToggle}
                disabled={!supported}
              >
                {playing ? <Pause size={22} /> : <Play size={22} />}
              </button>
              <button aria-label="Next story" onClick={() => next(1)}>
                <SkipForward size={17} />
              </button>
              <em>1×</em>
            </div>
          </section>
        )
      )}

      {/* ── Status strip ── */}
      {briefComplete ? (
        <div className="brief-done">
          <span>✓</span>
          <div>
            <b>Your brief is complete.</b>
            <small>You're caught up on the top stories for now.</small>
          </div>
          <button onClick={() => speak(articles[0])}>Replay</button>
        </div>
      ) : (
        <div className="narrating-strip">
          <span>♬</span>
          <b>
            {current ? 'Now narrating' : 'Up next'} —{' '}
            {featured?.headline || 'Loading your brief…'}
          </b>
        </div>
      )}

      {/* ── Bottom dock ── */}
      <footer className="brief-dock">
        <button aria-label="Discover">
          <Compass size={16} />
          <small>DISCOVER</small>
        </button>
        <button
          className="dock-play"
          aria-label={playing ? 'Pause narration' : 'Play narration'}
          onClick={startOrToggle}
          disabled={!featured || !supported}
        >
          {playing ? <Pause size={21} /> : <Play size={21} />}
        </button>
        <button aria-label="Settings">
          <Settings size={16} />
          <small>SETTINGS</small>
        </button>
      </footer>
    </main>
  );
}
