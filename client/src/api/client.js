const base = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const request = async (path, opts = {}, token) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const r = await fetch(base + path, {
      ...opts,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(opts.headers || {}),
      },
    });
    return { response: r, data: await r.json().catch(() => ({ message: 'The server returned an invalid response.' })) };
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The request timed out. Please try again.');
    throw error;
  } finally {
    clearTimeout(timeout);
  }
};

/** Force logout by clearing storage and firing the storage event so App.jsx reacts */
const forceLogout = () => {
  localStorage.removeItem('nuzio_token');
  localStorage.removeItem('nuzio_refresh');
  localStorage.removeItem('nuzio_user');
  window.dispatchEvent(new Event('storage'));
};

export const api = async (path, opts = {}) => {
  let token = localStorage.getItem('nuzio_token');
  let result = await request(path, opts, token);

  // Attempt a silent token refresh on 401 (except on auth routes themselves)
  if (result.response.status === 401 && !path.startsWith('/auth/')) {
    const refreshToken = localStorage.getItem('nuzio_refresh');
    if (refreshToken) {
      const refreshed = await request('/auth/refresh', {
        method: 'POST',
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshed.response.ok) {
        localStorage.setItem('nuzio_token', refreshed.data.token);
        localStorage.setItem('nuzio_refresh', refreshed.data.refreshToken);
        localStorage.setItem('nuzio_user', JSON.stringify(refreshed.data.user));
        result = await request(path, opts, refreshed.data.token);
      } else {
        // Refresh token invalid/expired — log the user out automatically
        forceLogout();
        throw new Error('Your session has expired. Please sign in again.');
      }
    } else {
      forceLogout();
      throw new Error('Please sign in to continue.');
    }
  }

  if (!result.response.ok) throw new Error(result.data.message || 'Request failed');
  return result.data;
};
