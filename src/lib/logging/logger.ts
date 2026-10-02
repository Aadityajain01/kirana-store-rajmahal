type LogLevel = 'info' | 'warn' | 'error' | 'debug';

export interface LogContext {
  requestId?: string;
  shopId?: string;
  userId?: string;
  action?: string;
  [key: string]: unknown;
}

export const logger = {
  log(level: LogLevel, message: string, context?: LogContext) {
    const entry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...context,
    };
    if (level === 'error') {
      console.error(JSON.stringify(entry));
    } else if (level === 'warn') {
      console.warn(JSON.stringify(entry));
    } else {
      console.log(JSON.stringify(entry));
    }
  },

  info(message: string, context?: LogContext) {
    this.log('info', message, context);
  },

  warn(message: string, context?: LogContext) {
    this.log('warn', message, context);
  },

  error(message: string, context?: LogContext) {
    this.log('error', message, context);
  },
};
