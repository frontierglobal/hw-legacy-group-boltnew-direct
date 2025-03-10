#!/usr/bin/env node

import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('Setting up Supabase database...');

// Ensure the script exists
const scriptPath = join(__dirname, 'src', 'scripts', 'setup-supabase.js');
if (!existsSync(scriptPath)) {
  console.error(`Error: Script not found at ${scriptPath}`);
  process.exit(1);
}

try {
  // Run the JavaScript version of the setup script
  console.log('Running setup script...');
  execSync('node src/scripts/setup-supabase.js', { 
    stdio: 'inherit',
    env: { ...process.env }
  });
  
  console.log('Supabase database setup completed successfully.');
} catch (error) {
  console.error('Error running setup script:', error.message);
  process.exit(1);
}
