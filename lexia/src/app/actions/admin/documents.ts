"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import type { ExtractionStatus } from "@/generated/prisma/client";

export type DocumentItem = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
  user: { name: string | null; email: string };
  latestExtraction: {
    status: ExtractionStatus;
    confidence: number;
  } | null;
};

export type DocumentsResult = {
  documents: DocumentItem[];
  total: number;
  page: number;
  perPage: number;
};

export type DocumentFilters = {
  search?: string;
  fileType?: string;
  page?: number;
  perPage?: number;
};

export async function getDocuments(
  filters: DocumentFilters,
): Promise<DocumentsResult> {
  await requireAdmin();

  const where: Record<string, unknown> = {};

  if (filters.search) {
    where.fileName = { contains: filters.search, mode: "insensitive" };
  }

  if (filters.fileType && filters.fileType !== "ALL") {
    if (filters.fileType === "PDF") {
      where.fileType = "application/pdf";
    } else if (filters.fileType === "IMAGE") {
      where.fileType = { startsWith: "image/" };
    }
  }

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;

  const [documents, total] = await Promise.all([
    prisma.document.findMany({
      where,
      select: {
        id: true,
        fileName: true,
        fileUrl: true,
        fileType: true,
        fileSize: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
        extractions: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { status: true, confidence: true },
        },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.document.count({ where }),
  ]);

  return {
    documents: documents.map((doc) => ({
      id: doc.id,
      fileName: doc.fileName,
      fileUrl: doc.fileUrl,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      createdAt: doc.createdAt,
      user: doc.user,
      latestExtraction: doc.extractions[0] ?? null,
    })),
    total,
    page,
    perPage,
  };
}

export type DocumentDetail = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: Date;
  user: { name: string | null; email: string };
  extractions: {
    id: string;
    data: unknown;
    confidence: number;
    status: ExtractionStatus;
    processingTimeMs: number | null;
    createdAt: Date;
  }[];
};

export async function getDocumentDetail(
  documentId: string,
): Promise<DocumentDetail | null> {
  await requireAdmin();

  const doc = await prisma.document.findUnique({
    where: { id: documentId },
    select: {
      id: true,
      fileName: true,
      fileUrl: true,
      fileType: true,
      fileSize: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
      extractions: {
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          data: true,
          confidence: true,
          status: true,
          processingTimeMs: true,
          createdAt: true,
        },
      },
    },
  });

  return doc;
}
