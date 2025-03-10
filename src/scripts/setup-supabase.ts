import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

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
      
      // Create content table
      const { error: createContentError } = await supabase.rpc('create_content_table');
      
      if (createContentError) {
        // If RPC doesn't exist, create table with raw SQL
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
      
      // Create pages table
      const { error: createPagesError } = await supabase.rpc('create_pages_table');
      
      if (createPagesError) {
        // If RPC doesn't exist, create table with raw SQL
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
      }
      
      logger.info('Pages table created successfully');
    } else {
      logger.info('Pages table already exists');
    }

    // Check if users table has role column
    const { data: usersColumns, error: usersColumnsError } = await supabase.rpc('get_table_columns', {
      table_name: 'auth.users'
    });

    if (usersColumnsError) {
      // If RPC doesn't exist, we'll try to add the column anyway
      logger.warn('Could not check users table columns:', usersColumnsError);
    }

    const hasRoleColumn = usersColumns ? usersColumns.some((col: any) => col.column_name === 'role') : false;

    if (!hasRoleColumn) {
      logger.info('Adding role column to users table...');
      
      // Add role column to users table
      const { error: addRoleError } = await supabase.rpc('add_role_to_users');
      
      if (addRoleError) {
        // If RPC doesn't exist, add column with raw SQL
        const { error: rawAddError } = await supabase.rpc('execute_sql', {
          sql_query: `
            ALTER TABLE auth.users 
            ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'user';
          `
        });
        
        if (rawAddError) {
          throw new Error(`Failed to add role column to users table: ${rawAddError.message}`);
        }
      }
      
      logger.info('Role column added to users table successfully');
    } else {
      logger.info('Role column already exists in users table');
    }

    // Check if user_roles table exists and drop it
    const { data: userRolesExists, error: userRolesCheckError } = await supabase.rpc('check_table_exists', {
      table_name: 'user_roles'
    });

    if (userRolesCheckError) {
      // If RPC doesn't exist, we'll try to drop the table anyway
      logger.warn('Could not check if user_roles table exists:', userRolesCheckError);
    }

    if (userRolesExists) {
      logger.info('Dropping user_roles table...');
      
      // Drop user_roles table
      const { error: dropUserRolesError } = await supabase.rpc('drop_user_roles_table');
      
      if (dropUserRolesError) {
        // If RPC doesn't exist, drop table with raw SQL
        const { error: rawDropError } = await supabase.rpc('execute_sql', {
          sql_query: `DROP TABLE IF EXISTS user_roles;`
        });
        
        if (rawDropError) {
          throw new Error(`Failed to drop user_roles table: ${rawDropError.message}`);
        }
      }
      
      logger.info('user_roles table dropped successfully');
    } else {
      logger.info('user_roles table does not exist');
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
  } else {
    logger.error('Supabase setup failed:', result.error);
  }
});
