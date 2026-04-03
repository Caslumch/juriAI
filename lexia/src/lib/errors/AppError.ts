export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly context?: Record<string, unknown>;

  constructor(options: {
    message: string;
    code: string;
    statusCode?: number;
    context?: Record<string, unknown>;
    cause?: unknown;
  }) {
    super(options.message, { cause: options.cause });
    this.name = "AppError";
    this.code = options.code;
    this.statusCode = options.statusCode ?? 500;
    this.context = options.context;
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      ...(this.context && { context: this.context }),
    };
  }
}
