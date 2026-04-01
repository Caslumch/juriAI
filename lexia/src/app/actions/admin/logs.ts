"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
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

  const where: Record<string, unknown> = {};

  if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.search) {
    where.document = {
      fileName: { contains: filters.search, mode: "insensitive" },
    };
  }

  if (filters.dateFrom || filters.dateTo) {
    where.createdAt = {};
    if (filters.dateFrom) {
      (where.createdAt as Record<string, unknown>).gte = new Date(
        filters.dateFrom,
      );
    }
    if (filters.dateTo) {
      (where.createdAt as Record<string, unknown>).lte = new Date(
        filters.dateTo + "T23:59:59.999Z",
      );
    }
  }

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;

  const [logs, total] = await Promise.all([
    prisma.extraction.findMany({
      where,
      select: {
        id: true,
        status: true,
        confidence: true,
        processingTimeMs: true,
        createdAt: true,
        document: {
          select: {
            id: true,
            fileName: true,
            fileType: true,
            user: {
              select: { name: true, email: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.extraction.count({ where }),
  ]);

  return {
    logs: logs.map((log) => ({
      id: log.id,
      status: log.status,
      confidence: log.confidence,
      processingTimeMs: log.processingTimeMs,
      createdAt: log.createdAt,
      document: {
        id: log.document.id,
        fileName: log.document.fileName,
        fileType: log.document.fileType,
      },
      user: log.document.user,
    })),
    total,
    page,
    perPage,
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

  const extraction = await prisma.extraction.findUnique({
    where: { id: extractionId },
    select: {
      id: true,
      data: true,
      confidence: true,
      status: true,
      processingTimeMs: true,
      createdAt: true,
      document: {
        select: {
          fileName: true,
          fileType: true,
          fileSize: true,
        },
      },
    },
  });

  return extraction;
}
