export const MAX_TASK_TITLE_LENGTH = 120;

export interface Task {
  readonly id: string;
  readonly title: string;
  readonly done: boolean;
}

export class InvalidTaskTitleError extends Error {
  constructor() {
    super(`A task title must have between 1 and ${MAX_TASK_TITLE_LENGTH} characters.`);
    this.name = 'InvalidTaskTitleError';
  }
}

export class TaskNotFoundError extends Error {
  constructor(id: string) {
    super(`Task "${id}" does not exist.`);
    this.name = 'TaskNotFoundError';
  }
}

export function isValidTitle(raw: string): boolean {
  const length = raw.trim().length;
  return length > 0 && length <= MAX_TASK_TITLE_LENGTH;
}

export function normalizeTitle(raw: string): string {
  if (!isValidTitle(raw)) {
    throw new InvalidTaskTitleError();
  }
  return raw.trim();
}
