"use server";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";

export type DashboardStats = {
  totalDocuments: number;
  totalExtractions: number;
  totalUsers: number;
  activeUsers: number;
  avgConfidence: number;
  avgProcessingTimeMs: number;
  successRate: number;
};

export type DayCount = {
  date: string;
  count: number;
};

export type ActivityItem = {
  id: string;
  action: string;
  userName: string | null;
  metadata: unknown;
  createdAt: Date;
};

export async function getDashboardStats(): Promise<DashboardStats> {
  await requireAdmin();

  const [
    totalDocuments,
    totalExtractions,
    totalUsers,
    activeUsers,
    avgAgg,
    completedCount,
  ] = await Promise.all([
    prisma.document.count(),
    prisma.extraction.count(),
    prisma.user.count(),
    prisma.user.count({ where: { isActive: true } }),
    prisma.extraction.aggregate({
      _avg: { confidence: true, processingTimeMs: true },
    }),
    prisma.extraction.count({ where: { status: "COMPLETED" } }),
  ]);

  const successRate =
    totalExtractions > 0 ? completedCount / totalExtractions : 0;

  return {
    totalDocuments,
    totalExtractions,
    totalUsers,
    activeUsers,
    avgConfidence: avgAgg._avg.confidence ?? 0,
    avgProcessingTimeMs: avgAgg._avg.processingTimeMs ?? 0,
    successRate,
  };
}

export async function getDocumentsPerDay(
  days: number = 30,
): Promise<DayCount[]> {
  await requireAdmin();

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
}

export async function getExtractionsPerDay(
  days: number = 30,
): Promise<DayCount[]> {
  await requireAdmin();

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
}

export async function getRecentActivity(
  limit: number = 20,
): Promise<ActivityItem[]> {
  await requireAdmin();

  const logs = await prisma.log.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      action: true,
      metadata: true,
      createdAt: true,
      user: {
        select: { name: true, email: true },
      },
    },
  });

  return logs.map((log) => ({
    id: log.id,
    action: log.action,
    userName: log.user?.name ?? log.user?.email ?? null,
    metadata: log.metadata,
    createdAt: log.createdAt,
  }));
}
