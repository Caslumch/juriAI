"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { adminService } from "@/services/admin.service";

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
  return adminService.getDashboardStats();
}

export async function getDocumentsPerDay(
  days: number = 30,
): Promise<DayCount[]> {
  await requireAdmin();
  return adminService.getDocumentsPerDay(days);
}

export async function getExtractionsPerDay(
  days: number = 30,
): Promise<DayCount[]> {
  await requireAdmin();
  return adminService.getExtractionsPerDay(days);
}

export async function getRecentActivity(
  limit: number = 20,
): Promise<ActivityItem[]> {
  await requireAdmin();
  return adminService.getRecentActivity(limit);
}
