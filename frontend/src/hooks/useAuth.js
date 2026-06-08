// src/hooks/useAuth.js
import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('ventech_token');
    const savedUser = localStorage.getItem('ventech_user');
    if (token && savedUser) {
      setUser(JSON.parse(savedUser));
      // Verify token is still valid
      getMe()
        .then((res) => setUser(res.data))
        .catch(() => {
          localStorage.removeItem('ventech_token');
          localStorage.removeItem('ventech_user');
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const authLogin = (token, userData) => {
    localStorage.setItem('ventech_token', token);
    localStorage.setItem('ventech_user', JSON.stringify(userData));
    setUser(userData);
  };

  const authLogout = () => {
    localStorage.removeItem('ventech_token');
    localStorage.removeItem('ventech_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, authLogin, authLogout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
