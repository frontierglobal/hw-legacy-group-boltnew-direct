import { mcpManager } from '../lib/mcp';
import { logger } from '../lib/logger';

async function main() {
  try {
    logger.info('Attempting to connect to Supabase via MCP...');
    const tables = await mcpManager.listTables('supabase');
    
    logger.info('Successfully connected to database. Tables found:', {
      count: tables.length,
      tables: tables
    });

    // Print tables in a formatted way
    console.log('\nDatabase Tables:');
    console.log('---------------');
    tables.forEach((table, index) => {
      console.log(`${index + 1}. ${table}`);
    });
    console.log('---------------\n');

  } catch (error) {
    logger.error('Failed to list tables:', error as Error);
    process.exit(1);
  } finally {
    // Clean up connections
    await mcpManager.disconnectAll();
  }
}

main(); 