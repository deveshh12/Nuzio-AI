import { useEffect, useState } from 'react';
import Login from './pages/Login';
import Feed from './pages/Feed';

export default function App() {
  const [logged, setLogged] = useState(!!localStorage.getItem('nuzio_token'));

  useEffect(() => {
    const onStorageChange = () =>
      setLogged(!!localStorage.getItem('nuzio_token'));

    window.addEventListener('storage', onStorageChange);
    return () => window.removeEventListener('storage', onStorageChange);
  }, []);

  const logout = () => {
    localStorage.removeItem('nuzio_token');
    localStorage.removeItem('nuzio_refresh');
    localStorage.removeItem('nuzio_user');
    setLogged(false);
  };

  return logged ? (
    <Feed logout={logout} />
  ) : (
    <Login success={() => setLogged(true)} />
  );
}
