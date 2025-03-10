import { createClient } from '@supabase/supabase-js';

// Direct Supabase credentials
const supabaseUrl = 'https://guyjytkicpevzceodmwk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd1eWp5dGtpY3BldnpjZW9kbXdrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEzNzE4MzksImV4cCI6MjA1Njk0NzgzOX0.y72nVTzR3Qa2MD6JQ1Sk8_aPpjfm_jf1RNRSAGW6S1Q';

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Simple logger
const logger = {
  info: (message, data) => console.log(`[INFO] ${message}`, data || ''),
  warn: (message, data) => console.warn(`[WARN] ${message}`, data || ''),
  error: (message, data) => console.error(`[ERROR] ${message}`, data || '')
};

/**
 * Script to set up Supabase tables and data
 * 
 * This script will:
 * 1. Create content table if missing
 * 2. Create pages table if missing
 * 3. Add role column to users table if missing
 * 4. Drop user_roles table if exists
 * 5. Insert test data
 */

async function setupSupabase() {
  try {
    logger.info('Starting Supabase setup...');

    // Check if content table exists
    const { data: contentTableExists, error: contentCheckError } = await supabase
      .from('content')
      .select('count(*)')
      .limit(1)
      .maybeSingle();

    if (contentCheckError && contentCheckError.code === '42P01') { // Table doesn't exist
      logger.info('Creating content table...');
      
      // Create content table with raw SQL
      const { error: rawCreateError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS content (
            id SERIAL PRIMARY KEY,
            key TEXT UNIQUE NOT NULL,
            value TEXT,
            updated_at TIMESTAMP DEFAULT NOW()
          );
        `
      });
      
      if (rawCreateError) {
        throw new Error(`Failed to create content table: ${rawCreateError.message}`);
      }
      
      logger.info('Content table created successfully');
    } else {
      logger.info('Content table already exists');
    }

    // Check if pages table exists
    const { data: pagesTableExists, error: pagesCheckError } = await supabase
      .from('pages')
      .select('count(*)')
      .limit(1)
      .maybeSingle();

    if (pagesCheckError && pagesCheckError.code === '42P01') { // Table doesn't exist
      logger.info('Creating pages table...');
      
      // Create pages table with raw SQL
      const { error: rawCreateError } = await supabase.rpc('execute_sql', {
        sql_query: `
          CREATE TABLE IF NOT EXISTS pages (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            slug TEXT UNIQUE NOT NULL,
            content TEXT,
            created_at TIMESTAMP DEFAULT NOW()
          );
        `
      });
      
      if (rawCreateError) {
        throw new Error(`Failed to create pages table: ${rawCreateError.message}`);
      }
      
      logger.info('Pages table created successfully');
    } else {
      logger.info('Pages table already exists');
    }

    // Add role column to users table
    logger.info('Adding role column to users table...');
    
    // Add role column with raw SQL
    const { error: rawAddError } = await supabase.rpc('execute_sql', {
      sql_query: `
        ALTER TABLE auth.users 
        ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
      `
    });
    
    if (rawAddError) {
      logger.warn(`Note: Could not add role column to users table: ${rawAddError.message}`);
      logger.info('This may be due to permissions or the column already exists');
    } else {
      logger.info('Role column added to users table successfully');
    }

    // Drop user_roles table if exists
    logger.info('Dropping user_roles table if it exists...');
    
    // Drop table with raw SQL
    const { error: rawDropError } = await supabase.rpc('execute_sql', {
      sql_query: `DROP TABLE IF EXISTS user_roles;`
    });
    
    if (rawDropError) {
      logger.warn(`Note: Could not drop user_roles table: ${rawDropError.message}`);
      logger.info('This may be due to permissions or the table does not exist');
    } else {
      logger.info('user_roles table dropped successfully (or did not exist)');
    }

    // Insert test data into content table
    logger.info('Inserting test data into content table...');
    
    const { error: insertContentError } = await supabase
      .from('content')
      .upsert([
        { key: 'home_title', value: 'Welcome to HW Legacy' }
      ], { onConflict: 'key' });
    
    if (insertContentError) {
      throw new Error(`Failed to insert test data into content table: ${insertContentError.message}`);
    }
    
    logger.info('Test data inserted into content table successfully');

    // Insert test data into pages table
    logger.info('Inserting test data into pages table...');
    
    const { error: insertPagesError } = await supabase
      .from('pages')
      .upsert([
        { title: 'About', slug: 'about', content: 'About page' }
      ], { onConflict: 'slug' });
    
    if (insertPagesError) {
      throw new Error(`Failed to insert test data into pages table: ${insertPagesError.message}`);
    }
    
    logger.info('Test data inserted into pages table successfully');

    logger.info('Supabase setup completed successfully');
    return { success: true };
  } catch (error) {
    const formattedError = error instanceof Error ? error : new Error(String(error));
    logger.error('Error setting up Supabase:', formattedError);
    return { success: false, error: formattedError };
  }
}

// Run the setup function
setupSupabase().then(result => {
  if (result.success) {
    logger.info('Supabase setup completed successfully');
    process.exit(0);
  } else {
    logger.error('Supabase setup failed:', result.error);
    process.exit(1);
  }
});
