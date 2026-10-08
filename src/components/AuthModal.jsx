import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldIcon, UserIcon } from './Icons';

export function AuthModal() {
  const { authModal, closeAuthModal, setAuthModalMode, login, register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!authModal.isOpen) return null;

  const mode = authModal.mode; // 'login', 'register', 'admin'

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      if (mode === 'register') {
        const res = await register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
        if (!res.ok) setError(res.error);
      } else {
        // login or admin
        const res = await login({
          email: formData.email,
          password: formData.password
        });
        if (!res.ok) setError(res.error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillAdminCredentials = () => {
    setFormData({
      name: '',
      email: 'admin@huq.org',
      password: 'Admin@123'
    });
    setError('');
  };

  return (
    <div className="modal-backdrop" onClick={closeAuthModal}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button className="modal-close" onClick={closeAuthModal} aria-label="Close modal">
          ×
        </button>

        <div className="modal-head">
          <img src="/img/huq-mark.webp" width="48" height="48" alt="HuQ" style={{ display: 'block', margin: '0 auto 12px' }} />
          <h2>
            {mode === 'register' && 'Create Your Account'}
            {mode === 'login' && 'Welcome Back'}
            {mode === 'admin' && 'Administrator Login'}
          </h2>
          <p className="modal-sub">
            {mode === 'register' && 'Track your humane quotient growth across sessions.'}
            {mode === 'login' && 'Sign in to access your saved profile and test history.'}
            {mode === 'admin' && 'Access administrative analytics and user submission search.'}
          </p>
        </div>

        <div className="modal-tabs">
          <button
            type="button"
            className={`modal-tab ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setAuthModalMode('login'); setError(''); }}
          >
            <UserIcon size={16} /> Sign In
          </button>
          <button
            type="button"
            className={`modal-tab ${mode === 'register' ? 'active' : ''}`}
            onClick={() => { setAuthModalMode('register'); setError(''); }}
          >
            Register
          </button>
          <button
            type="button"
            className={`modal-tab ${mode === 'admin' ? 'active' : ''}`}
            onClick={() => { setAuthModalMode('admin'); setError(''); }}
          >
            <ShieldIcon size={16} /> Admin
          </button>
        </div>

        {error && <div className="modal-err" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="modal-form">
          {mode === 'register' && (
            <div className="field">
              <label htmlFor="reg-name">Full Name</label>
              <input
                id="reg-name"
                name="name"
                type="text"
                required
                maxLength="80"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Priyanshu Sharma"
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="auth-email">Email Address</label>
            <input
              id="auth-email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label htmlFor="auth-password">Password</label>
            <input
              id="auth-password"
              name="password"
              type="password"
              required
              minLength="6"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
            />
          </div>

          {mode === 'admin' && (
            <div style={{ textAlign: 'right', marginBottom: '8px' }}>
              <button
                type="button"
                className="btn-link"
                onClick={fillAdminCredentials}
                style={{ fontSize: '0.85rem', color: 'var(--amber)' }}
              >
                Auto-fill default admin credentials
              </button>
            </div>
          )}

          <button className="btn primary" type="submit" disabled={submitting} style={{ width: '100%', marginTop: '12px' }}>
            {submitting ? 'Please wait…' : mode === 'register' ? 'Create Account' : mode === 'admin' ? 'Access Admin Console' : 'Sign In'}
          </button>
        </form>

        <div className="modal-foot">
          {mode === 'login' && (
            <p>
              Don't have an account?{' '}
              <button type="button" className="btn-link" onClick={() => setAuthModalMode('register')}>
                Sign up here
              </button>
            </p>
          )}
          {mode === 'register' && (
            <p>
              Already have an account?{' '}
              <button type="button" className="btn-link" onClick={() => setAuthModalMode('login')}>
                Sign in here
              </button>
            </p>
          )}
          {mode === 'admin' && (
            <p>
              Standard participant?{' '}
              <button type="button" className="btn-link" onClick={() => setAuthModalMode('login')}>
                Back to User Login
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
