"use client";

import { useState, useEffect, useCallback } from "react";
import { StatCard } from "./StatCard";
import { SimpleBarChart } from "./SimpleBarChart";
import { ActivityFeed } from "./ActivityFeed";
import {
  getDashboardStats,
  getDocumentsPerDay,
  getRecentActivity,
  type DashboardStats,
  type DayCount,
  type ActivityItem,
} from "@/app/actions/admin/monitoring";
import { formatDuration, formatPercentage } from "@/shared/utils/format";

export function MonitoringDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [docsPerDay, setDocsPerDay] = useState<DayCount[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    try {
      const [statsData, docsData, activityData] = await Promise.all([
        getDashboardStats(),
        getDocumentsPerDay(30),
        getRecentActivity(20),
      ]);
      setStats(statsData);
      setDocsPerDay(docsData);
      setActivities(activityData);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-[var(--space-8)]">
        <span className="text-small text-text-tertiary">
          Carregando dashboard...
        </span>
      </div>
    );
  }

  if (!stats) return null;

  const confidenceColor =
    stats.avgConfidence >= 0.85
      ? "success"
      : stats.avgConfidence >= 0.6
        ? "warning"
        : "danger";

  const successColor =
    stats.successRate >= 0.9
      ? "success"
      : stats.successRate >= 0.7
        ? "warning"
        : "danger";

  return (
    <div className="space-y-[var(--space-6)]">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-[var(--space-4)]">
        <StatCard
          label="Documentos Processados"
          value={String(stats.totalDocuments)}
          color="primary"
        />
        <StatCard
          label="Taxa de Sucesso"
          value={formatPercentage(stats.successRate)}
          color={successColor}
        />
        <StatCard
          label="Confiança Média"
          value={formatPercentage(stats.avgConfidence)}
          color={confidenceColor}
        />
        <StatCard
          label="Tempo Médio"
          value={
            stats.avgProcessingTimeMs
              ? formatDuration(stats.avgProcessingTimeMs)
              : "—"
          }
        />
      </div>

      {/* Chart */}
      <SimpleBarChart
        data={docsPerDay}
        label="Documentos por Dia (últimos 30 dias)"
      />

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[var(--space-4)]">
        {/* Extra stats */}
        <div className="bg-bg-primary border border-border rounded-[var(--radius-lg)] p-[var(--space-5)] shadow-xs">
          <h3 className="text-small font-semibold text-text-primary mb-[var(--space-5)]">
            Resumo Geral
          </h3>
          <div className="space-y-[var(--space-4)]">
            <div className="flex items-center justify-between">
              <span className="text-small text-text-secondary">
                Total de Usuários
              </span>
              <span className="text-small font-mono font-semibold text-text-primary">
                {stats.totalUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-small text-text-secondary">
                Usuários Ativos
              </span>
              <span className="text-small font-mono font-semibold text-success">
                {stats.activeUsers}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-small text-text-secondary">
                Total de Extrações
              </span>
              <span className="text-small font-mono font-semibold text-text-primary">
                {stats.totalExtractions}
              </span>
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <ActivityFeed activities={activities} />
      </div>
    </div>
  );
}
