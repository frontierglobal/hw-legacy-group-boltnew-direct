// Logger utility for consistent logging across the application
const LOG_LEVELS = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
} as const;

type LogLevel = typeof LOG_LEVELS[keyof typeof LOG_LEVELS];

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  error?: Error;
}

class Logger {
  private static instance: Logger;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;

  private constructor() {
    // Initialize logger
    console.log('Logger initialized');
  }

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  private formatLogEntry(level: LogLevel, message: string, data?: any, error?: Error): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      error
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
  }

  debug(message: string, data?: any) {
    const entry = this.formatLogEntry(LOG_LEVELS.DEBUG, message, data);
    this.addLog(entry);
    console.debug(`[${entry.timestamp}] DEBUG:`, message, data || '');
  }

  info(message: string, data?: any) {
    const entry = this.formatLogEntry(LOG_LEVELS.INFO, message, data);
    this.addLog(entry);
    console.info(`[${entry.timestamp}] INFO:`, message, data || '');
  }

  warn(message: string, data?: any) {
    const entry = this.formatLogEntry(LOG_LEVELS.WARN, message, data);
    this.addLog(entry);
    console.warn(`[${entry.timestamp}] WARN:`, message, data || '');
  }

  error(message: string, error?: Error, data?: any) {
    const entry = this.formatLogEntry(LOG_LEVELS.ERROR, message, data, error);
    this.addLog(entry);
    console.error(`[${entry.timestamp}] ERROR:`, message, error || '', data || '');
  }

  // Get all logs
  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  // Get logs by level
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.logs.filter(log => log.level === level);
  }

  // Get recent logs
  getRecentLogs(count: number = 100): LogEntry[] {
    return this.logs.slice(-count);
  }

  // Clear logs
  clearLogs() {
    this.logs = [];
  }
}

export const logger = Logger.getInstance(); 