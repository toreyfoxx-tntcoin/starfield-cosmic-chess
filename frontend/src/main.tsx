import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { initSentry } from './utils/sentry';
import { initDevTools } from './utils/devTools';

// Initialize Sentry for error tracking
initSentry();

// Initialize dev tools (dev-only)
initDevTools();


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
