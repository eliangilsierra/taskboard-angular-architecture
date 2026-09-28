export type AppErrorKind = 'validation' | 'not-found' | 'unexpected';

export const UNEXPECTED_ERROR_MESSAGE = 'Something went wrong. Please try again.';

/** The only error shape the UI knows: a kind for code, a message safe to show to users. */
export class AppError extends Error {
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
