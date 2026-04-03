import type { Logger } from "pino";
import { randomUUID } from "node:crypto";

export interface LogContext {
  requestId: string;
  userId?: string;
  operation?: string;
}

export function generateRequestId(): string {
  return randomUUID().slice(0, 8);
}

export function withRequestContext(log: Logger, context: LogContext): Logger {
  return log.child(context);
}
