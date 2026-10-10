import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const connection = navigator.connection;
const updateTabVisibility = () => {
  document.documentElement.classList.toggle('tab-hidden', document.visibilityState !== 'visible');
};
document.addEventListener('visibilitychange', updateTabVisibility);
updateTabVisibility();

if (
  (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
  (connection && connection.saveData)
) {
  document.documentElement.classList.add('lite');
}

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error) => {
      console.warn('HuQ offline support could not be enabled.', error);
    });
  }, { once: true });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
