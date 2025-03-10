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
    private initialized: boolean = false;

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

    async initialize(serverName?: string): Promise<void> {
        if (this.initialized) {
            logger.warn('MCP Manager already initialized');
            return;
        }

        try {
            if (serverName) {
                await this.connect(serverName);
            } else {
                await Promise.all(this.config.servers.map(server => this.connect(server.name)));
            }
            this.initialized = true;
            logger.info('MCP Manager initialized successfully');
        } catch (error) {
            logger.error('Failed to initialize MCP Manager:', error as Error);
            throw error;
        }
    }

    async connect(serverName: string): Promise<any> {
        try {
            const server = this.config.servers.find(s => s.name === serverName);
            if (!server) {
                throw new Error(`Server ${serverName} not found in configuration`);
            }

            if (this.connections.has(serverName)) {
                return this.connections.get(serverName);
            }

            logger.info(`Attempting to connect to ${serverName} at ${server.url}`);
            
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
        this.initialized = false;
    }

    getServerConfig(serverName: string): ServerConfig | undefined {
        return this.config.servers.find(s => s.name === serverName);
    }

    isInitialized(): boolean {
        return this.initialized;
    }
}

export const mcpManager = new MCPManager(); 