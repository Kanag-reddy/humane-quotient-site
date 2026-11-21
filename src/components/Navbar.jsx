import React, { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTestResult } from '../context/TestContext';
import { UserIcon, ShieldIcon, LogoutIcon } from './Icons';
import { LANGUAGES, getLanguage, setLanguage } from '../i18n';

export function Navbar({ currentRoute, setCurrentRoute }) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { result } = useTestResult();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [language, setLanguageState] = useState(() => getLanguage());
  const [languageOpen, setLanguageOpen] = useState(false);
  const languageRef = useRef(null);

  useEffect(() => {
    const closeLanguage = (event) => {
      if (languageRef.current && !languageRef.current.contains(event.target)) setLanguageOpen(false);
    };
    const updateLanguage = (event) => setLanguageState(event.detail?.code || getLanguage());
    document.addEventListener('pointerdown', closeLanguage);
    window.addEventListener('huq-language-change', updateLanguage);
    return () => {
      document.removeEventListener('pointerdown', closeLanguage);
      window.removeEventListener('huq-language-change', updateLanguage);
    };
  }, []);

  const navigate = (route) => {
    setCurrentRoute(route);
    setMobileOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className={`nav ${mobileOpen ? 'open' : ''}`} id="nav">
      <a
        className="brand"
        href="#/"
        onClick={(e) => {
          e.preventDefault();
          navigate('home');
        }}
        aria-label="Humane Quotient home"
      >
        <img
          src="/img/huq-mark.webp"
          width="34"
          height="34"
          alt=""
          aria-hidden="true"
          id="brandMark"
        />
        <span>
          Humane <b>Quotient</b>
        </span>
      </a>

      <button
        className="nav-btn"
        id="navBtn"
        type="button"
        aria-label={mobileOpen ? 'Close menu' : 'Menu'}
        aria-expanded={mobileOpen}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        <span />
        <span />
        <span />
      </button>

      <nav aria-label="Main" id="mainNav">
        <a
          href="#/"
          className={currentRoute === 'home' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            navigate('home');
          }}
        >
          Introduction
        </a>

        <a
          href="#/test"
          className={currentRoute === 'test' ? 'active' : ''}
          onClick={(e) => {
            e.preventDefault();
            navigate('test');
          }}
        >
          Take the Test
        </a>

        <a
          href="#/profile"
          className={`${currentRoute === 'profile' ? 'active' : ''} ${!result ? 'locked' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            if (result) navigate('profile');
          }}
          aria-disabled={!result}
          tabIndex={result ? undefined : -1}
        >
          My Profile
        </a>

        <a
          href="#/plan"
          className={`${currentRoute === 'plan' ? 'active' : ''} ${!result ? 'locked' : ''}`}
          onClick={(e) => {
            e.preventDefault();
            if (result) navigate('plan');
          }}
          aria-disabled={!result}
          tabIndex={result ? undefined : -1}
        >
          Action Plan
        </a>

        <div className="nav-language" ref={languageRef}>
          <button
            type="button"
            className="nav-language-btn"
            aria-haspopup="listbox"
            aria-expanded={languageOpen}
            onClick={() => setLanguageOpen((open) => !open)}
          >
            <svg aria-hidden="true" viewBox="0 0 32 32" width="22" height="22" fill="none">
              <circle cx="16" cy="16" r="13" stroke="currentColor" strokeWidth="2.2" />
              <path d="M3 16h26M16 3c4.2 3.7 6.4 8 6.4 13S20.2 25.3 16 29C11.8 25.3 9.6 21 9.6 16S11.8 6.7 16 3Z" stroke="currentColor" strokeWidth="2.2" strokeLinejoin="round" />
            </svg>
            <span>{LANGUAGES.find(([code]) => code === language)?.[1] || 'English'}</span>
            <svg className="nav-language-chevron" aria-hidden="true" viewBox="0 0 16 16" width="14" height="14" fill="none">
              <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {languageOpen && (
            <div className="nav-language-menu" role="listbox" aria-label="Choose language">
              {LANGUAGES.map(([code, name]) => (
                <button
                  type="button"
                  role="option"
                  aria-selected={language === code}
                  key={code}
                  className={language === code ? 'active' : ''}
                  onClick={() => {
                    setLanguageState(code);
                    setLanguage(code);
                    setLanguageOpen(false);
                  }}
                >
                  <span>{name}</span>
                  {language === code && <b aria-hidden="true">✓</b>}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="nav-auth-section">
          {isAuthenticated ? (
            <div className="nav-user-info">
              <span className="user-pill" title={user.email}>
                <UserIcon size={14} /> {user.name.split(' ')[0]}
                {isAdmin && <b className="admin-chip">ADMIN</b>}
              </span>
              <button
                type="button"
                className="btn-logout"
                onClick={() => {
                  logout();
                  if (currentRoute === 'admin' || currentRoute === 'history') {
                    navigate('home');
                  }
                }}
                title="Log out"
              >
                <LogoutIcon size={15} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              className="btn gold nav-login-btn"
              onClick={() => openAuthModal('login')}
            >
              <UserIcon size={15} /> Sign In
            </button>
          )}
        </div>

        {isAuthenticated && (
          <a
            href="#/history"
            className={currentRoute === 'history' ? 'active' : ''}
            onClick={(e) => {
              e.preventDefault();
              navigate('history');
            }}
          >
            My History
          </a>
        )}

        {isAdmin && (
          <a
            href="#/admin"
            className={`admin-nav-link ${currentRoute === 'admin' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              navigate('admin');
            }}
          >
            <ShieldIcon size={15} /> Admin Console
          </a>
        )}
      </nav>
    </header>
  );
}
