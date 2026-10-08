import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('huq_token') || null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState({ isOpen: false, mode: 'login' });

  useEffect(() => {
    async function verifyUser() {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.ok && data.user) {
          setUser(data.user);
        } else {
          // Token expired or invalid
          localStorage.removeItem('huq_token');
          setToken(null);
          setUser(null);
        }
      } catch (err) {
        console.error('Failed to verify token:', err);
      } finally {
        setLoading(false);
      }
    }
    verifyUser();
  }, [token]);

  const login = async ({ email, password }) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!data.ok) {
        return { ok: false, error: data.error || 'Login failed.' };
      }
      localStorage.setItem('huq_token', data.token);
      setToken(data.token);
      setUser(data.user);
      closeAuthModal();
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, error: 'Network error during login.' };
    }
  };

  const register = async ({ name, email, password }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const data = await res.json();
      if (!data.ok) {
        return { ok: false, error: data.error || 'Registration failed.' };
      }
      localStorage.setItem('huq_token', data.token);
      setToken(data.token);
      setUser(data.user);
      closeAuthModal();
      return { ok: true, user: data.user };
    } catch (err) {
      return { ok: false, error: 'Network error during registration.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('huq_token');
    setToken(null);
    setUser(null);
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModal({ isOpen: true, mode });
  };

  const closeAuthModal = () => {
    setAuthModal({ isOpen: false, mode: 'login' });
  };

  const value = {
    user,
    token,
    loading,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    login,
    register,
    logout,
    authModal,
    openAuthModal,
    closeAuthModal,
    setAuthModalMode: (mode) => setAuthModal((prev) => ({ ...prev, mode }))
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
