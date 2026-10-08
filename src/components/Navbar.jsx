import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTest } from '../context/TestContext';
import { UserIcon, ShieldIcon, LogoutIcon } from './Icons';

export function Navbar({ currentRoute, setCurrentRoute }) {
  const { user, isAuthenticated, isAdmin, logout, openAuthModal } = useAuth();
  const { result } = useTest();
  const [mobileOpen, setMobileOpen] = useState(false);

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
        >
          Action Plan
        </a>

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
      </nav>
    </header>
  );
}
