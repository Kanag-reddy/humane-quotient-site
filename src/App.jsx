import React, { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TestProvider, useTest } from './context/TestContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './views/HomeView';
import { TestView } from './views/TestView';
import { ProfileView } from './views/ProfileView';
import { ActionPlanView } from './views/ActionPlanView';
import { AdminView } from './views/AdminView';
import { UserHistoryView } from './views/UserHistoryView';

function AppContent() {
  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash.replace(/^#\/?/, '') || 'home';
    return ['home', 'test', 'profile', 'plan', 'admin', 'history'].includes(hash) ? hash : 'home';
  });

  const { resetTest } = useTest();

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace(/^#\/?/, '') || 'home';
      if (['home', 'test', 'profile', 'plan', 'admin', 'history'].includes(hash)) {
        setCurrentRoute(hash);
      }
    };
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (route) => {
    window.location.hash = `#/${route}`;
    setCurrentRoute(route);
  };

  return (
    <div className="app-layout">
      <Navbar currentRoute={currentRoute} setCurrentRoute={navigateTo} />

      <main id="app" tabIndex={-1}>
        {currentRoute === 'home' && (
          <HomeView
            onStartTest={() => navigateTo('test')}
            onOpenAbout={() => {
              const el = document.getElementById('about');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {currentRoute === 'test' && (
          <TestView
            onFinishTest={() => navigateTo('profile')}
            onGoProfile={() => navigateTo('profile')}
          />
        )}

        {currentRoute === 'profile' && (
          <ProfileView
            onGoPlan={() => navigateTo('plan')}
            onRetake={() => {
              resetTest();
              navigateTo('test');
            }}
          />
        )}

        {currentRoute === 'plan' && (
          <ActionPlanView
            onBackProfile={() => navigateTo('profile')}
            onRetake={() => {
              resetTest();
              navigateTo('test');
            }}
          />
        )}

        {currentRoute === 'admin' && <AdminView />}

        {currentRoute === 'history' && (
          <UserHistoryView
            onSelectSubmission={() => navigateTo('profile')}
            onRetake={() => {
              resetTest();
              navigateTo('test');
            }}
          />
        )}
      </main>

      <footer className="foot">
        <p className="one-line">
          Based on the book <em>Test Your Humane Quotient</em> (First Edition, Revised) by Dr Rachiraju Sai Krishna &amp; Prof Dr Thothathri Venugopal.
        </p>
        <p>© 2026 Sri Sathya Sai University for Human Excellence.</p>
      </footer>

      <AuthModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <TestProvider>
        <AppContent />
      </TestProvider>
    </AuthProvider>
  );
}
