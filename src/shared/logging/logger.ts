type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelOrder: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

let debugLoggingEnabled = import.meta.env.MODE === 'development';

export function setLoggerDebugEnabled(enabled: boolean): void {
  debugLoggingEnabled = enabled;
}

class Logger {
  constructor(private readonly scope: string) {}

  debug(...args: unknown[]): void {
    if (!debugLoggingEnabled) {
      return;
    }

    this.log('debug', ...args);
  }

  info(...args: unknown[]): void {
    this.log('info', ...args);
  }

  warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }

  error(...args: unknown[]): void {
    this.log('error', ...args);
  }

  private log(level: LogLevel, ...args: unknown[]): void {
    if (level === 'debug' && !debugLoggingEnabled) {
      return;
    }

    const prefix = `[AutoCoupon][${this.scope}]`;
    const method =
      levelOrder[level] >= levelOrder.error
        ? console.error
        : levelOrder[level] >= levelOrder.warn
          ? console.warn
          : levelOrder[level] >= levelOrder.info
            ? console.info
            : console.debug;

    method(prefix, ...args);
  }
}

export function createLogger(scope: string): Logger {
  return new Logger(scope);
}
