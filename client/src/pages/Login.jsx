import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '../api/client';
import Logo from '../components/Logo';
import '../google-button.css';

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

export default function Login({ success }) {
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [mode, setMode] = useState('login');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [googleReady, setGoogleReady] = useState(false);

  // Keep a stable ref so the GSI callback always sees the latest finish fn
  const finishRef = useRef(null);
  const googleButtonRef = useRef(null);
  const googleInitialisedRef = useRef(false);

  const finish = useCallback(data => {
    localStorage.setItem('nuzio_token', data.token);
    localStorage.setItem('nuzio_refresh', data.refreshToken);
    localStorage.setItem('nuzio_user', JSON.stringify(data.user));
    success();
  }, [success]);

  // Update ref whenever finish changes (it won't, but keeps it clean)
  useEffect(() => { finishRef.current = finish; }, [finish]);

  // Initialise Google GSI once on mount
  useEffect(() => {
    if (!googleClientId) return;

    const handleGoogleResponse = async response => {
      setBusy(true);
      setError('');
      try {
        finishRef.current(await api('/auth/google', {
          method: 'POST',
          body: JSON.stringify({ credential: response.credential }),
        }));
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    };

    const initialise = () => {
      if (googleInitialisedRef.current || !googleButtonRef.current) return;
      googleInitialisedRef.current = true;
      window.google.accounts.id.initialize({
        client_id: googleClientId,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
      });
      window.google.accounts.id.renderButton(googleButtonRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'pill',
        logo_alignment: 'left',
        width: Math.min(360, Math.max(250, googleButtonRef.current.clientWidth)),
      });
      setGoogleReady(true);
    };

    if (window.google?.accounts) {
      initialise();
    } else {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = initialise;
      script.onerror = () => setError('Google sign-in could not be loaded.');
      document.head.appendChild(script);
      return () => script.remove();
    }
  }, []); // intentionally empty — runs once on mount

  const submit = async event => {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      finish(await api(`/auth/${mode}`, { method: 'POST', body: JSON.stringify(form) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const googleSignIn = async () => {
    setError('');
    // Dev fallback when no VITE_GOOGLE_CLIENT_ID is set
    if (!googleClientId) {
      try {
        setBusy(true);
        finish(await api('/auth/google/mock', { method: 'POST' }));
      } catch (err) {
        setError(err.message);
      } finally {
        setBusy(false);
      }
    } else setError('Google sign-in is still loading. Please try again in a moment.');
  };

  return (
    <main className="login">
      <div className="login-glow" />
      <section className="login-panel">
        <Logo />
        <div className="intro">
          <h1>Good morning.</h1>
          <h2>News on go.</h2>
          <p>Personalised audio news for Indian<br />professionals — curated every morning.</p>
        </div>
        <form onSubmit={submit} noValidate>
          {mode === 'register' && (
            <label>
              <span>Your name</span>
              <input
                autoComplete="name"
                placeholder="Aarav Sharma"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
              />
            </label>
          )}
          <label>
            <span>Email address</span>
            <input
              type="email"
              autoComplete="email"
              placeholder="you@company.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </label>
          <label>
            <span>Password</span>
            <input
              type="password"
              minLength="8"
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              placeholder="At least 8 characters"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <button className="primary" disabled={busy}>
            {busy ? 'Please wait…' : mode === 'login' ? 'Continue' : 'Create account'}
          </button>
        </form>
        <div className="or"><span />or<span /></div>
        {googleClientId ? (
          <div
            ref={googleButtonRef}
            className={`google-google-button${googleReady ? '' : ' loading'}`}
            aria-label="Continue with Google"
          />
        ) : (
          <button className="google" type="button" disabled={busy} onClick={googleSignIn}>
            <b>G</b> Continue with Google
          </button>
        )}
        <button
          className="switch"
          type="button"
          onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}
        >
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Sign in'}
        </button>
        <small>By continuing you agree to our <u>Terms</u> &amp; <u>Privacy Policy</u>.</small>
      </section>
    </main>
  );
}
