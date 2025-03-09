import { supabase } from '../lib/supabase';
import { logger } from '../lib/logger';

async function verifyDatabase() {
  try {
    logger.info('Starting database verification...');

    // Drop user_roles table if exists
    try {
      await supabase.rpc('drop_user_roles_if_exists');
      logger.info('Dropped user_roles table if it existed');
    } catch (error) {
      logger.warn('Error dropping user_roles table:', error);
    }

    // Add role column to users table
    try {
      await supabase.rpc('add_role_column_if_not_exists');
      logger.info('Added role column to users table if it did not exist');
    } catch (error) {
      logger.warn('Error adding role column:', error);
    }

    // Create content table
    const { error: contentError } = await supabase
      .from('content')
      .select('id')
      .limit(1);

    if (contentError?.code === '42P01') {
      logger.info('Content table does not exist, creating...');
      await supabase.rpc('create_content_table');
    } else {
      logger.info('Content table exists');
    }

    // Create pages table
    const { error: pagesError } = await supabase
      .from('pages')
      .select('id')
      .limit(1);

    if (pagesError?.code === '42P01') {
      logger.info('Pages table does not exist, creating...');
      await supabase.rpc('create_pages_table');
    } else {
      logger.info('Pages table exists');
    }

    // Insert test data
    const { error: insertContentError } = await supabase
      .from('content')
      .upsert({ key: 'home_title', value: 'Welcome to HW Legacy' })
      .select();

    if (insertContentError) {
      logger.error('Error inserting content:', insertContentError);
    } else {
      logger.info('Test content inserted successfully');
    }

    const { error: insertPageError } = await supabase
      .from('pages')
      .upsert({ title: 'About', slug: 'about', content: 'About page' })
      .select();

    if (insertPageError) {
      logger.error('Error inserting page:', insertPageError);
    } else {
      logger.info('Test page inserted successfully');
    }

    logger.info('Database verification completed');
  } catch (error) {
    logger.error('Error during database verification:', error);
    throw error;
  }
}

// Run the verification
verifyDatabase().catch(error => {
  logger.error('Failed to verify database:', error);
  process.exit(1);
}); 