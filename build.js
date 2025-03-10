#!/usr/bin/env node

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Building the project with environment variables...');

// Read environment variables from .env file
const envPath = join(__dirname, '.env');
try {
  const envContent = readFileSync(envPath, 'utf8');
  const envVars = {};
  
  // Parse .env file
  envContent.split('\n').forEach(line => {
    const trimmedLine = line.trim();
    if (trimmedLine && !trimmedLine.startsWith('#')) {
      const [key, ...valueParts] = trimmedLine.split('=');
      const value = valueParts.join('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    }
  });
  
  console.log('Environment variables loaded from .env file');
  
  // Run the build command with environment variables
  console.log('Running build...');
  execSync('npm run build', { 
    stdio: 'inherit',
    env: { ...process.env, ...envVars }
  });
  
  console.log('Build completed successfully.');
} catch (error) {
  console.error('Error building the project:', error.message);
  process.exit(1);
}
