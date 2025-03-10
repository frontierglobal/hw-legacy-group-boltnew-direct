import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { logger } from './lib/logger';

logger.info('Application starting...');

try {
  const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
  
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );

  logger.info('Application rendered successfully');
} catch (error) {
  logger.error('Failed to start application:', error as Error);
  
  // Show a basic error message
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'min-height: 100vh; display: flex; align-items: center; justify-content: center; background-color: rgb(249, 250, 251); padding: 1rem;';
  errorDiv.innerHTML = `
    <div style="max-width: 28rem; text-align: center;">
      <h1 style="font-size: 1.875rem; font-weight: 800; color: rgb(17, 24, 39); margin-bottom: 1rem;">Failed to start application</h1>
      <p style="color: rgb(107, 114, 128);">Please check the console for more details and try reloading the page.</p>
      <button onclick="window.location.reload()" style="margin-top: 1rem; padding: 0.5rem 1rem; background-color: rgb(37, 99, 235); color: white; border-radius: 0.375rem; font-weight: 500;">Reload page</button>
    </div>
  `;
  document.body.appendChild(errorDiv);
}
