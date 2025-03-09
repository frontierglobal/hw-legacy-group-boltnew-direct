import { logger } from './logger';

interface ServerConfig {
    name: string;
    url: string;
}

interface MCPConfig {
    servers: ServerConfig[];
}

class MCPManager {
    private config: MCPConfig;
    private connections: Map<string, any> = new Map();

    constructor() {
        // Load config from .cursor/mcp.json
        this.config = {
            servers: [
                {
                    name: "supabase",
                    url: "postgresql://postgres:d!GeA5RGP3Y*KtRI@guyjytkicpevzceodmwk.supabase.co:5432/postgres"
                },
                {
                    name: "git",
                    url: "https://github.com/frontierglobal/hw-legacy-group-boltnew-direct.git"
                }
            ]
        };
    }

    async connect(serverName: string): Promise<any> {
        try {
            const server = this.config.servers.find(s => s.name === serverName);
            if (!server) {
                throw new Error(`Server ${serverName} not found in configuration`);
            }

            // For now, we'll just log the connection attempt
            logger.info(`Attempting to connect to ${serverName} at ${server.url}`);
            
            // In a real implementation, we would establish the connection here
            // For now, we'll return a mock connection
            const connection = {
                pool: {},
                close: async () => {
                    logger.info(`Closing connection to ${serverName}`);
                    this.connections.delete(serverName);
                }
            };

            this.connections.set(serverName, connection);
            return connection;
        } catch (error) {
            logger.error(`Failed to connect to ${serverName}:`, error as Error);
            throw error;
        }
    }

    async disconnect(serverName: string): Promise<void> {
        const connection = this.connections.get(serverName);
        if (connection) {
            await connection.close();
        }
    }

    async disconnectAll(): Promise<void> {
        for (const [serverName] of this.connections) {
            await this.disconnect(serverName);
        }
    }

    getServerConfig(serverName: string): ServerConfig | undefined {
        return this.config.servers.find(s => s.name === serverName);
    }
}

export const mcpManager = new MCPManager(); 