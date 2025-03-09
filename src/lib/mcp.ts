import { logger } from './logger';
import { readFileSync } from 'fs';
import { join } from 'path';

interface MCPConfig {
  servers: MCPServer[];
  cursorAI: CursorAIConfig;
}

interface MCPServer {
  name: string;
  type: string;
  url: string;
  pool: PoolConfig;
  ssl: SSLConfig;
  retryOptions: RetryOptions;
  logging: LoggingConfig;
}

interface PoolConfig {
  max: number;
  min: number;
  idleTimeoutMillis: number;
  connectionTimeoutMillis: number;
}

interface SSLConfig {
  rejectUnauthorized: boolean;
  ca: string | null;
  key: string | null;
  cert: string | null;
}

interface RetryOptions {
  maxRetries: number;
  initialRetryDelayMillis: number;
  maxRetryDelayMillis: number;
}

interface LoggingConfig {
  level: string;
  queries: boolean;
  slowQueryThresholdMillis: number;
}

interface CursorAIConfig {
  enabled: boolean;
  features: {
    autoComplete: boolean;
    syntaxHighlighting: boolean;
    diagnostics: boolean;
    codeActions: boolean;
    inlineCompletions: boolean;
  };
  modelConfig: {
    temperature: number;
    maxTokens: number;
    model: string;
  };
}

class MCPManager {
  private static instance: MCPManager;
  private config: MCPConfig;
  private connections: Map<string, any>;
  private retryTimeouts: Map<string, NodeJS.Timeout>;

  private constructor() {
    this.connections = new Map();
    this.retryTimeouts = new Map();
    this.config = this.loadConfig();
  }

  static getInstance(): MCPManager {
    if (!MCPManager.instance) {
      MCPManager.instance = new MCPManager();
    }
    return MCPManager.instance;
  }

  private loadConfig(): MCPConfig {
    try {
      const configPath = join(process.cwd(), '.cursor', 'mcp.json');
      const configContent = readFileSync(configPath, 'utf-8');
      const config = JSON.parse(configContent);
      logger.info('MCP configuration loaded successfully');
      return config;
    } catch (error) {
      logger.error('Failed to load MCP configuration:', error as Error);
      throw new Error('Failed to load MCP configuration');
    }
  }

  async connect(serverName: string): Promise<any> {
    try {
      const server = this.config.servers.find(s => s.name === serverName);
      if (!server) {
        throw new Error(`Server "${serverName}" not found in MCP configuration`);
      }

      if (this.connections.has(serverName)) {
        return this.connections.get(serverName);
      }

      logger.info(`Establishing connection to ${serverName}...`);

      // In a real implementation, this would create a database connection
      // using the configuration settings
      const connection = {
        connected: true,
        server: server.name,
        pool: server.pool,
        timestamp: new Date()
      };

      this.connections.set(serverName, connection);
      logger.info(`Successfully connected to ${serverName}`);

      return connection;
    } catch (error) {
      logger.error(`Failed to connect to ${serverName}:`, error as Error);
      this.handleConnectionError(serverName, error as Error);
      throw error;
    }
  }

  private handleConnectionError(serverName: string, error: Error): void {
    const server = this.config.servers.find(s => s.name === serverName);
    if (!server) return;

    const retryCount = this.retryTimeouts.has(serverName) ? 1 : 0;
    if (retryCount < server.retryOptions.maxRetries) {
      const delay = Math.min(
        server.retryOptions.initialRetryDelayMillis * Math.pow(2, retryCount),
        server.retryOptions.maxRetryDelayMillis
      );

      logger.info(`Retrying connection to ${serverName} in ${delay}ms (attempt ${retryCount + 1}/${server.retryOptions.maxRetries})`);

      const timeout = setTimeout(() => {
        this.retryTimeouts.delete(serverName);
        this.connect(serverName).catch(() => {
          // Error handling is done in connect()
        });
      }, delay);

      this.retryTimeouts.set(serverName, timeout);
    }
  }

  async disconnect(serverName: string): Promise<void> {
    try {
      const connection = this.connections.get(serverName);
      if (!connection) return;

      // In a real implementation, this would close the database connection
      this.connections.delete(serverName);
      
      const timeout = this.retryTimeouts.get(serverName);
      if (timeout) {
        clearTimeout(timeout);
        this.retryTimeouts.delete(serverName);
      }

      logger.info(`Disconnected from ${serverName}`);
    } catch (error) {
      logger.error(`Error disconnecting from ${serverName}:`, error as Error);
      throw error;
    }
  }

  async disconnectAll(): Promise<void> {
    const serverNames = Array.from(this.connections.keys());
    await Promise.all(serverNames.map(name => this.disconnect(name)));
  }

  getConnection(serverName: string): any | undefined {
    return this.connections.get(serverName);
  }

  getCursorAIConfig(): CursorAIConfig {
    return this.config.cursorAI;
  }

  getServerConfig(serverName: string): MCPServer | undefined {
    return this.config.servers.find(s => s.name === serverName);
  }

  async listTables(serverName: string): Promise<string[]> {
    try {
      const connection = await this.connect(serverName);
      if (!connection) {
        throw new Error(`No connection available for server ${serverName}`);
      }

      // Query to get all tables in the public schema
      const query = `
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
      `;

      // In a real implementation, this would execute the query
      // For now, we'll return a list of tables we know exist from our migrations
      return [
        'roles',
        'user_roles',
        'properties',
        'businesses',
        'investments',
        'documents',
        'transactions',
        'audit_logs',
        'pages',
        'content'
      ];
    } catch (error) {
      logger.error(`Error listing tables for ${serverName}:`, error as Error);
      throw error;
    }
  }
}

export const mcpManager = MCPManager.getInstance(); 