import React, { lazy, Suspense, useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import { TestProvider, useTestRouting } from './context/TestContext';
import { Navbar } from './components/Navbar';
import { AuthModal } from './components/AuthModal';
import { HomeView } from './views/HomeView';
import { TestView } from './views/TestView';

const loadProfileView = () => import('./views/ProfileView').then((module) => ({ default: module.ProfileView }));
const loadActionPlanView = () => import('./views/ActionPlanView').then((module) => ({ default: module.ActionPlanView }));
const ProfileView = lazy(loadProfileView);
const ActionPlanView = lazy(loadActionPlanView);
const AdminView = lazy(() => import('./views/AdminView').then((module) => ({ default: module.AdminView })));
const UserHistoryView = lazy(() => import('./views/UserHistoryView').then((module) => ({ default: module.UserHistoryView })));

function readRoute() {
  const route = window.location.hash.replace(/^#\/?/, '').split('?')[0] || 'home';
  return ['home', 'test', 'profile', 'plan', 'admin', 'history'].includes(route) ? route : 'home';
}

function AppContent() {
  const { result, step, phase, setStep, setPhase, resetTest } = useTestRouting();
  const [currentRoute, setCurrentRoute] = useState(() => {
    const route = readRoute();
    return !result && (route === 'profile' || route === 'plan') ? 'test' : route;
  });
  const [displayRoute, setDisplayRoute] = useState(currentRoute);
  const [transitionState, setTransitionState] = useState('idle');

  useEffect(() => {
    const handleLocation = () => {
      let route = readRoute();
      if (!result && (route === 'profile' || route === 'plan')) {
        window.history.replaceState(window.history.state, '', '#/test');
        route = 'test';
      }
      setCurrentRoute(route);
      if (route === 'test' && window.history.state) {
        const { huqStep, huqPhase } = window.history.state;
        if (Number.isInteger(huqStep) && huqStep >= 0 && huqStep < 8) setStep(huqStep);
        if (huqPhase === 'step' || huqPhase === 'intro') setPhase(huqPhase);
      }
    };
    handleLocation();
    window.addEventListener('hashchange', handleLocation);
    window.addEventListener('popstate', handleLocation);
    return () => {
      window.removeEventListener('hashchange', handleLocation);
      window.removeEventListener('popstate', handleLocation);
    };
  }, [result, setPhase, setStep]);

  useEffect(() => {
    if (displayRoute === currentRoute) return undefined;
    setTransitionState('exit');
    const timer = setTimeout(() => {
      setDisplayRoute(currentRoute);
      setTransitionState('enter');
    }, 180);
    return () => clearTimeout(timer);
  }, [currentRoute, displayRoute]);

  useEffect(() => {
    if (transitionState !== 'enter') return undefined;
    const timer = setTimeout(() => setTransitionState('idle'), 220);
    return () => clearTimeout(timer);
  }, [transitionState]);

  useEffect(() => {
    if (!result) return undefined;
    let idleId;
    let timerId;
    if ('requestIdleCallback' in window) {
      idleId = window.requestIdleCallback(() => {
        loadProfileView();
        loadActionPlanView();
      }, { timeout: 2000 });
      return () => window.cancelIdleCallback(idleId);
    }
    timerId = window.setTimeout(() => {
      loadProfileView();
      loadActionPlanView();
    }, 0);
    return () => window.clearTimeout(timerId);
  }, [result]);

  const navigateTo = (route) => {
    if (!result && (route === 'profile' || route === 'plan')) route = 'test';
    if (route === 'test') {
      const nextPhase = result || phase === 'saving' ? 'intro' : phase;
      const currentState = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
      setPhase(nextPhase);
      window.location.hash = `#/${route}`;
      window.history.replaceState({ ...currentState, huqStep: step, huqPhase: nextPhase }, '', window.location.href);
      setCurrentRoute(route);
      return;
    }
    window.location.hash = `#/${route}`;
    setCurrentRoute(route);
  };

  const changeTestStep = useCallback((nextStep, nextPhase) => {
    const currentState = window.history.state && typeof window.history.state === 'object' ? window.history.state : {};
    window.history.pushState({ ...currentState, huqStep: nextStep, huqPhase: nextPhase }, '', window.location.href);
    setStep(nextStep);
    setPhase(nextPhase);
  }, [setPhase, setStep]);

  return (
    <div className="app-layout">
      <Navbar currentRoute={currentRoute} setCurrentRoute={navigateTo} />

      <main id="app" tabIndex={-1}>
        <div className={`route-view ${transitionState}`} aria-live={transitionState === 'enter' ? 'polite' : undefined}>
        <Suspense fallback={<div className="route-loading" role="status">Loading page…</div>}>
        {displayRoute === 'home' && (
          <HomeView
            onStartTest={() => navigateTo('test')}
            onOpenAbout={() => {
              const el = document.getElementById('about');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        )}

        {displayRoute === 'test' && (
          <TestView
            onFinishTest={() => navigateTo('profile')}
            onGoProfile={() => navigateTo('profile')}
            onStepChange={changeTestStep}
          />
        )}

        {displayRoute === 'profile' && (
          <ProfileView
            onGoPlan={() => navigateTo('plan')}
            onRetake={() => {
              resetTest();
              navigateTo('test');
            }}
          />
        )}

        {displayRoute === 'plan' && (
          <ActionPlanView
            onBackProfile={() => navigateTo('profile')}
            onRetake={() => {
              resetTest();
              navigateTo('test');
            }}
          />
        )}

        {displayRoute === 'admin' && <AdminView />}

        {displayRoute === 'history' && (
          <UserHistoryView
            onSelectSubmission={() => navigateTo('profile')}
            onRetake={() => {
              resetTest();
              navigateTo('test');
            }}
          />
        )}
        </Suspense>
        </div>
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
