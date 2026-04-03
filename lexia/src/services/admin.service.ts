import { createLogger } from "@/lib/logger";
import { documentRepository } from "@/repositories/document.repository";
import { extractionRepository } from "@/repositories/extraction.repository";
import { logRepository } from "@/repositories/log.repository";
import { userRepository } from "@/repositories/user.repository";
import { prisma } from "@/lib/prisma";
import type { DocumentFilters } from "@/repositories/document.repository";
import type { ExtractionFilters } from "@/repositories/extraction.repository";

const log = createLogger("admin");

export const adminService = {
  async getDashboardStats() {
    const [
      totalDocuments,
      totalExtractions,
      totalUsers,
      activeUsers,
      avgAgg,
      completedCount,
    ] = await Promise.all([
      documentRepository.count(),
      prisma.extraction.count(),
      userRepository.count(),
      userRepository.count({ isActive: true }),
      extractionRepository.aggregate(),
      extractionRepository.countByStatus("COMPLETED"),
    ]);

    const successRate =
      totalExtractions > 0 ? completedCount / totalExtractions : 0;

    log.debug({ totalDocuments, totalExtractions, successRate }, "Dashboard stats fetched");

    return {
      totalDocuments,
      totalExtractions,
      totalUsers,
      activeUsers,
      avgConfidence: avgAgg._avg.confidence ?? 0,
      avgProcessingTimeMs: avgAgg._avg.processingTimeMs ?? 0,
      successRate,
    };
  },

  async getDocumentsPerDay(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results: { date: Date; count: bigint }[] = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM documents
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return results.map((r) => ({
      date: new Date(r.date).toISOString().split("T")[0],
      count: Number(r.count),
    }));
  },

  async getExtractionsPerDay(days: number = 30) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const results: { date: Date; count: bigint }[] = await prisma.$queryRaw`
      SELECT DATE("createdAt") as date, COUNT(*)::bigint as count
      FROM extractions
      WHERE "createdAt" >= ${since}
      GROUP BY DATE("createdAt")
      ORDER BY date ASC
    `;

    return results.map((r) => ({
      date: new Date(r.date).toISOString().split("T")[0],
      count: Number(r.count),
    }));
  },

  async getRecentActivity(limit: number = 20) {
    return logRepository.findRecent(limit);
  },

  async getDocuments(filters: DocumentFilters) {
    return documentRepository.findMany(filters);
  },

  async getDocumentDetail(documentId: string) {
    return documentRepository.findById(documentId);
  },

  async getExtractionLogs(filters: ExtractionFilters) {
    return extractionRepository.findMany(filters);
  },

  async getExtractionDetail(extractionId: string) {
    return extractionRepository.findById(extractionId);
  },
};
