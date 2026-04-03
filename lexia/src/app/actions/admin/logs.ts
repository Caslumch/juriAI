"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { adminService } from "@/services/admin.service";
import type { ExtractionStatus } from "@/generated/prisma/client";

export type ExtractionLogItem = {
  id: string;
  status: ExtractionStatus;
  confidence: number;
  processingTimeMs: number | null;
  createdAt: Date;
  document: {
    id: string;
    fileName: string;
    fileType: string;
  };
  user: {
    name: string | null;
    email: string;
  } | null;
};

export type LogsResult = {
  logs: ExtractionLogItem[];
  total: number;
  page: number;
  perPage: number;
};

export type LogFilters = {
  search?: string;
  status?: ExtractionStatus | "ALL";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
};

export async function getExtractionLogs(
  filters: LogFilters,
): Promise<LogsResult> {
  await requireAdmin();
  const result = await adminService.getExtractionLogs(filters);
  return {
    logs: result.extractions,
    total: result.total,
    page: result.page,
    perPage: result.perPage,
  };
}

export type ExtractionDetail = {
  id: string;
  data: unknown;
  confidence: number;
  status: ExtractionStatus;
  processingTimeMs: number | null;
  createdAt: Date;
  document: {
    fileName: string;
    fileType: string;
    fileSize: number;
  };
};

export async function getExtractionDetail(
  extractionId: string,
): Promise<ExtractionDetail | null> {
  await requireAdmin();
  return adminService.getExtractionDetail(extractionId);
}
