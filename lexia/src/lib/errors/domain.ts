import { AppError } from "./AppError";

export class OcrError extends AppError {
  constructor(
    message: string,
    options?: { cause?: unknown; context?: Record<string, unknown> },
  ) {
    super({
      message,
      code: "OCR_ERROR",
      statusCode: 500,
      ...options,
    });
    this.name = "OcrError";
  }
}

export class ExtractionError extends AppError {
  constructor(
    message: string,
    options?: { cause?: unknown; context?: Record<string, unknown> },
  ) {
    super({
      message,
      code: "EXTRACTION_ERROR",
      statusCode: 500,
      ...options,
    });
    this.name = "ExtractionError";
  }
}

export class AuthError extends AppError {
  constructor(
    message: string,
    options?: { cause?: unknown; context?: Record<string, unknown> },
  ) {
    super({
      message,
      code: "AUTH_ERROR",
      statusCode: 401,
      ...options,
    });
    this.name = "AuthError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    options?: { cause?: unknown; context?: Record<string, unknown> },
  ) {
    super({
      message,
      code: "VALIDATION_ERROR",
      statusCode: 400,
      ...options,
    });
    this.name = "ValidationError";
  }
}

export class NotFoundError extends AppError {
  constructor(
    message: string,
    options?: { cause?: unknown; context?: Record<string, unknown> },
  ) {
    super({
      message,
      code: "NOT_FOUND",
      statusCode: 404,
      ...options,
    });
    this.name = "NotFoundError";
  }
}
