import { logger } from './logger';

interface MCPConfig {
    servers: {
        [key: string]: {
            host: string;
            port: number;
            protocol: 'http' | 'https';
            timeout: number;
            retries: number;
            backoff: number;
        };
    };
    defaultServer: string;
    maxConnections: number;
    connectionTimeout: number;
    retryDelay: number;
    maxRetries: number;
}

// Default configuration that can be overridden by environment variables
const defaultConfig: MCPConfig = {
    servers: {
        'default': {
            host: import.meta.env.VITE_MCP_HOST || 'localhost',
            port: parseInt(import.meta.env.VITE_MCP_PORT || '3000'),
            protocol: (import.meta.env.VITE_MCP_PROTOCOL || 'http') as 'http' | 'https',
            timeout: parseInt(import.meta.env.VITE_MCP_TIMEOUT || '5000'),
            retries: parseInt(import.meta.env.VITE_MCP_RETRIES || '3'),
            backoff: parseInt(import.meta.env.VITE_MCP_BACKOFF || '1000')
        }
    },
    defaultServer: import.meta.env.VITE_MCP_DEFAULT_SERVER || 'default',
    maxConnections: parseInt(import.meta.env.VITE_MCP_MAX_CONNECTIONS || '10'),
    connectionTimeout: parseInt(import.meta.env.VITE_MCP_CONNECTION_TIMEOUT || '5000'),
    retryDelay: parseInt(import.meta.env.VITE_MCP_RETRY_DELAY || '1000'),
    maxRetries: parseInt(import.meta.env.VITE_MCP_MAX_RETRIES || '3')
};

export class MCPManager {
    private static instance: MCPManager;
    private config: MCPConfig;
    private connections: Map<string, WebSocket> = new Map();
    private reconnectAttempts: Map<string, number> = new Map();
    private messageHandlers: Map<string, Set<(data: any) => void>> = new Map();
    private initialized: boolean = false;
    private connectionPromises: Map<string, Promise<void>> = new Map();

    private constructor(config: Partial<MCPConfig> = {}) {
        this.config = { ...defaultConfig, ...config };
        logger.info('MCP Manager initialized with config:', this.config);
    }

    static getInstance(): MCPManager {
        if (!MCPManager.instance) {
            MCPManager.instance = new MCPManager();
        }
        return MCPManager.instance;
    }

    initialize(serverName: string = this.config.defaultServer): Promise<void> {
        if (this.initialized) {
            logger.warn('MCP Manager already initialized');
            return Promise.resolve();
        }

        return this.connect(serverName)
            .then(() => {
                this.initialized = true;
                logger.info('MCP Manager initialized successfully');
            })
            .catch(error => {
                logger.error('Failed to initialize MCP Manager:', error instanceof Error ? error : new Error(String(error)));
                throw error;
            });
    }

    connect(serverName: string = this.config.defaultServer): Promise<void> {
        const server = this.config.servers[serverName];
        if (!server) {
            return Promise.reject(new Error(`Server ${serverName} not found in configuration`));
        }

        if (this.connections.has(serverName)) {
            logger.warn(`Already connected to server ${serverName}`);
            return Promise.resolve();
        }

        // If there's already a connection attempt in progress, return that promise
        if (this.connectionPromises.has(serverName)) {
            return this.connectionPromises.get(serverName)!;
        }

        const connectionPromise = new Promise<void>((resolve, reject) => {
            try {
                const ws = new WebSocket(`${server.protocol}://${server.host}:${server.port}`);
                
                const timeout = setTimeout(() => {
                    ws.close();
                    reject(new Error(`Connection timeout for ${serverName}`));
                }, this.config.connectionTimeout);

                ws.onopen = () => {
                    clearTimeout(timeout);
                    logger.info(`Connected to MCP server ${serverName}`);
                    this.connections.set(serverName, ws);
                    this.reconnectAttempts.set(serverName, 0);
                    this.connectionPromises.delete(serverName);
                    resolve();
                };

                ws.onclose = () => {
                    clearTimeout(timeout);
                    logger.warn(`Connection to ${serverName} closed`);
                    this.handleDisconnect(serverName);
                };

                ws.onerror = (event: Event) => {
                    clearTimeout(timeout);
                    const error = new Error(`WebSocket error for ${serverName}`);
                    logger.error(error.message, error);
                    this.handleDisconnect(serverName);
                    reject(error);
                };

                ws.onmessage = (event: MessageEvent) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(serverName, message);
                    } catch (error) {
                        logger.error(`Error parsing message from ${serverName}:`, error instanceof Error ? error : new Error(String(error)));
                    }
                };

            } catch (error) {
                this.connectionPromises.delete(serverName);
                reject(error instanceof Error ? error : new Error(String(error)));
            }
        });

        this.connectionPromises.set(serverName, connectionPromise);
        return connectionPromise;
    }

    private handleDisconnect(serverName: string): void {
        this.connections.delete(serverName);
        const attempts = this.reconnectAttempts.get(serverName) || 0;
        
        if (attempts < this.config.maxRetries) {
            setTimeout(() => {
                this.reconnectAttempts.set(serverName, attempts + 1);
                this.connect(serverName).catch(error => {
                    logger.error(`Failed to reconnect to ${serverName}:`, error instanceof Error ? error : new Error(String(error)));
                });
            }, this.config.retryDelay * Math.pow(2, attempts));
        } else {
            logger.error(`Max reconnection attempts reached for ${serverName}`);
        }
    }

    private handleMessage(serverName: string, message: any): void {
        const { type, data } = message;
        const handlers = this.messageHandlers.get(type);
        
        if (handlers) {
            handlers.forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    logger.error(`Error in message handler for ${type}:`, error instanceof Error ? error : new Error(String(error)));
                }
            });
        } else {
            logger.warn(`No handlers registered for message type: ${type}`);
        }
    }

    on(type: string, handler: (data: any) => void): void {
        if (!this.messageHandlers.has(type)) {
            this.messageHandlers.set(type, new Set());
        }
        this.messageHandlers.get(type)!.add(handler);
    }

    off(type: string, handler: (data: any) => void): void {
        const handlers = this.messageHandlers.get(type);
        if (handlers) {
            handlers.delete(handler);
            if (handlers.size === 0) {
                this.messageHandlers.delete(type);
            }
        }
    }

    send(serverName: string, type: string, data: any): void {
        const connection = this.connections.get(serverName);
        if (!connection) {
            throw new Error(`Not connected to server ${serverName}`);
        }

        try {
            connection.send(JSON.stringify({ type, data }));
        } catch (error) {
            logger.error(`Failed to send message to ${serverName}:`, error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }

    disconnect(serverName: string = this.config.defaultServer): void {
        const connection = this.connections.get(serverName);
        if (connection) {
            connection.close();
            this.connections.delete(serverName);
            this.reconnectAttempts.delete(serverName);
        }
    }

    disconnectAll(): void {
        this.connections.forEach((connection, serverName) => {
            this.disconnect(serverName);
        });
    }

    isInitialized(): boolean {
        return this.initialized;
    }
}

// Export a singleton instance
export const mcpManager = MCPManager.getInstance(); 