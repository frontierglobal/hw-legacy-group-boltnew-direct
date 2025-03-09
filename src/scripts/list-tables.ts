import { mcpServerManager } from '../server/mcp-server';

async function main() {
    try {
        const serverName = process.argv[2] || 'default';
        const tables = await mcpServerManager.listTables(serverName);
        console.log('Available tables:', tables);
    } catch (error) {
        console.error('Error listing tables:', error instanceof Error ? error : new Error(String(error)));
        process.exit(1);
    }
}

main(); 