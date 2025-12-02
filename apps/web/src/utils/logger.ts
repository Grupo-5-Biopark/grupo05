/**
 * Logger Utility
 * Environment-aware logging that only logs in development mode
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug';

class Logger {
  private readonly isDevelopment: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private log(level: LogLevel, ...args: unknown[]): void {
    if (!this.isDevelopment) return;

    const timestamp = new Date().toLocaleTimeString('pt-BR');
    const prefix = `[${timestamp}]`;

    switch (level) {
      case 'error':
        console.error(prefix, ...args);
        break;
      case 'warn':
        console.warn(prefix, ...args);
        break;
      case 'info':
        console.info(prefix, ...args);
        break;
      case 'debug':
        console.debug(prefix, ...args);
        break;
      default:
        console.log(prefix, ...args);
    }
  }

  /**
   * Logs a general message (only in development)
   */
  info(...args: unknown[]): void {
    this.log('info', ...args);
  }

  /**
   * Logs a warning message (only in development)
   */
  warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }

  /**
   * Logs an error message (only in development)
   */
  error(...args: unknown[]): void {
    this.log('error', ...args);
  }

  /**
   * Logs a debug message (only in development)
   */
  debug(...args: unknown[]): void {
    this.log('debug', ...args);
  }

  /**
   * Logs an API request
   */
  apiRequest(method: string, url: string, data?: unknown): void {
    this.log('info', `🔵 API ${method.toUpperCase()}`, url, data || '');
  }

  /**
   * Logs an API response
   */
  apiResponse(
    method: string,
    url: string,
    status: number,
    data?: unknown,
  ): void {
    const emoji = status >= 200 && status < 300 ? '✅' : '❌';
    this.log(
      'info',
      `${emoji} API ${method.toUpperCase()}`,
      url,
      `[${status}]`,
      data || '',
    );
  }

  /**
   * Logs an API error
   */
  apiError(method: string, url: string, error: unknown): void {
    this.log('error', `❌ API ${method.toUpperCase()}`, url, error);
  }

  /**
   * Logs authentication events
   */
  auth(action: string, details?: unknown): void {
    this.log('info', `🔐 Auth: ${action}`, details || '');
  }

  /**
   * Logs navigation events
   */
  navigation(from: string, to: string): void {
    this.log('info', `🧭 Navigation: ${from} → ${to}`);
  }

  /**
   * Logs user actions
   */
  userAction(action: string, details?: unknown): void {
    this.log('info', `👤 User Action: ${action}`, details || '');
  }

  /**
   * Logs form submissions
   */
  formSubmit(formName: string, data?: unknown): void {
    this.log('info', `📝 Form Submit: ${formName}`, data || '');
  }

  /**
   * Logs validation errors
   */
  validationError(field: string, error: string): void {
    this.log('warn', `⚠️ Validation Error [${field}]:`, error);
  }

  /**
   * Logs performance metrics
   */
  performance(label: string, duration: number): void {
    this.log('debug', `⚡ Performance [${label}]:`, `${duration}ms`);
  }
}

// Export a singleton instance
export const logger = new Logger();

// Export the class for testing purposes
export default Logger;
