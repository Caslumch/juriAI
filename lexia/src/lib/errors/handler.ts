import type { Logger } from "pino";
import { AppError } from "./AppError";

export function handleApiError(error: unknown, log: Logger): Response {
  if (error instanceof AppError) {
    log.warn({ err: error, code: error.code }, error.message);
    return Response.json(error.toJSON(), { status: error.statusCode });
  }

  if (error instanceof Error) {
    log.error({ err: error }, "Unexpected error");
    return Response.json(
      { error: "Erro interno do servidor.", code: "INTERNAL_ERROR" },
      { status: 500 },
    );
  }

  log.error({ err: error }, "Unknown error type");
  return Response.json(
    { error: "Erro interno do servidor.", code: "INTERNAL_ERROR" },
    { status: 500 },
  );
}
