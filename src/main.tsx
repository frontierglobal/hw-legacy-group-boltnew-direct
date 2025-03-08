import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Check for required environment variables
const requiredEnvVars = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY'];
const missingEnvVars = requiredEnvVars.filter(varName => !import.meta.env[varName]);

if (missingEnvVars.length > 0) {
  console.error('Missing required environment variables:', missingEnvVars);
  document.body.innerHTML = `
    <div style="padding: 20px; color: red;">
      <h1>Configuration Error</h1>
      <p>Missing required environment variables: ${missingEnvVars.join(', ')}</p>
    </div>
  `;
} else {
  const rootElement = document.getElementById('root');
  
  if (!rootElement) {
    console.error('Root element not found');
    document.body.innerHTML = '<div style="padding: 20px; color: red;">Root element not found</div>';
  } else {
    try {
      createRoot(rootElement).render(
        <StrictMode>
          <App />
        </StrictMode>
      );
    } catch (error) {
      console.error('Error rendering app:', error);
      document.body.innerHTML = `
        <div style="padding: 20px; color: red;">
          <h1>Error Initializing Application</h1>
          <pre>${error instanceof Error ? error.message : String(error)}</pre>
        </div>
      `;
    }
  }
}
