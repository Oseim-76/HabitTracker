type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: unknown;
}

export const Logger = {
  logs: [] as LogEntry[],
  maxLogs: 100,

  log(level: LogLevel, message: string, data?: unknown) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
    };

    this.logs.unshift(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.pop();
    }

    if (__DEV__) {
      console[level](message, data);
    }
  },

  info(message: string, data?: unknown) {
    this.log('info', message, data);
  },

  warn(message: string, data?: unknown) {
    this.log('warn', message, data);
  },

  error(message: string, error?: unknown) {
    this.log('error', message, error);
  },

  getLogs() {
    return [...this.logs];
  },

  async exportLogs(): Promise<string> {
    return JSON.stringify(this.logs, null, 2);
  },
}; 