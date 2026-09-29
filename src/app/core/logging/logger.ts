export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export type LogContext = Readonly<Record<string, unknown>>;

/** What the application needs from a logger, wherever the messages end up. */
export abstract class Logger {
  abstract debug(message: string, context?: LogContext): void;
  abstract info(message: string, context?: LogContext): void;
  abstract warn(message: string, context?: LogContext): void;
  abstract error(message: string, context?: LogContext): void;
}
