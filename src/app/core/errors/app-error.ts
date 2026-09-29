export type AppErrorKind = 'validation' | 'not-found' | 'unexpected';

export const UNEXPECTED_ERROR_MESSAGE = 'Something went wrong. Please try again.';

const ERROR_ID_LENGTH = 8;

/**
 * A short reference that a user can quote in a report and a developer can find in the logs.
 * It is not a secret and does not need to be unique across sessions, so plain randomness is enough.
 */
export function createErrorId(): string {
  const timePart = Date.now().toString(36).slice(-4);
  const randomPart = Math.random().toString(36).slice(2).padEnd(ERROR_ID_LENGTH, '0');
  return (timePart + randomPart).slice(0, ERROR_ID_LENGTH);
}

/** The only error shape the UI knows: a kind for code, a message safe to show to users. */
export class AppError extends Error {
  readonly id = createErrorId();

  constructor(
    readonly kind: AppErrorKind,
    readonly userMessage: string,
    options?: { cause?: unknown }
  ) {
    super(userMessage, options);
    this.name = 'AppError';
  }
}

/** Anything that is not already an AppError is, by definition, unexpected. */
export function toAppError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }
  return new AppError('unexpected', UNEXPECTED_ERROR_MESSAGE, { cause: error });
}
