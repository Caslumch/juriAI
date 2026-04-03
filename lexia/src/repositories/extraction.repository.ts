import { prisma } from "./base";
import type { ExtractionStatus } from "@/generated/prisma/client";

export type ExtractionFilters = {
  search?: string;
  status?: ExtractionStatus | "ALL";
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  perPage?: number;
};

export const extractionRepository = {
  async findMany(filters: ExtractionFilters) {
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
      const createdAt: Record<string, unknown> = {};
      if (filters.dateFrom) {
        createdAt.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        createdAt.lte = new Date(filters.dateTo + "T23:59:59.999Z");
      }
      where.createdAt = createdAt;
    }

    const page = filters.page ?? 1;
    const perPage = filters.perPage ?? 20;

    const [extractions, total] = await Promise.all([
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
              user: { select: { name: true, email: true } },
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
      extractions: extractions.map((e) => ({
        id: e.id,
        status: e.status,
        confidence: e.confidence,
        processingTimeMs: e.processingTimeMs,
        createdAt: e.createdAt,
        document: {
          id: e.document.id,
          fileName: e.document.fileName,
          fileType: e.document.fileType,
        },
        user: e.document.user,
      })),
      total,
      page,
      perPage,
    };
  },

  async findById(id: string) {
    return prisma.extraction.findUnique({
      where: { id },
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
  },

  async aggregate() {
    return prisma.extraction.aggregate({
      _avg: { confidence: true, processingTimeMs: true },
    });
  },

  async countByStatus(status: ExtractionStatus) {
    return prisma.extraction.count({ where: { status } });
  },
};
