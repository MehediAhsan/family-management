import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { getErrorMessage } from '../services/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [sessionError, setSessionError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('family_token');
    if (!token) {
      setReady(true);
      return;
    }

    api.get('/users/me')
      .then(({ data }) => setUser(data.user))
      .catch((error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('family_token');
          setUser(null);
        } else {
          setSessionError(getErrorMessage(error));
        }
      })
      .finally(() => setReady(true));
  }, []);

  const signIn = (result) => {
    localStorage.setItem('family_token', result.token);
    setSessionError('');
    setUser(result.user);
  };

  const signOut = () => {
    localStorage.removeItem('family_token');
    setSessionError('');
    setUser(null);
  };

  const value = useMemo(() => ({ user, ready, signIn, signOut, setUser, sessionError }), [user, ready, sessionError]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider.');
  return context;
}
