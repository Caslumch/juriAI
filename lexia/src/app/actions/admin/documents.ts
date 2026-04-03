"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { adminService } from "@/services/admin.service";
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

export async function getDocuments(
  filters: DocumentFilters,
): Promise<DocumentsResult> {
  await requireAdmin();
  return adminService.getDocuments(filters);
}

export async function getDocumentDetail(
  documentId: string,
): Promise<DocumentDetail | null> {
  await requireAdmin();
  return adminService.getDocumentDetail(documentId);
}
