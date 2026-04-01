"use client";

import { AdminTable, StatusBadge } from "@/components/admin/shared";
import { formatDate, formatDuration, formatPercentage } from "@/shared/utils/format";
import { statusVariant, statusLabel } from "./LogDetail";
import type { ExtractionLogItem } from "@/app/actions/admin/logs";
import { ChevronDown } from "lucide-react";

interface LogsTableProps {
  logs: ExtractionLogItem[];
  expandedId: string | null;
  onToggleExpand: (id: string) => void;
}

export function LogsTable({
  logs,
  expandedId,
  onToggleExpand,
}: LogsTableProps) {
  const columns = [
    {
      key: "document",
      label: "Documento",
      render: (log: ExtractionLogItem) => (
        <div>
          <p className="font-medium text-text-primary truncate max-w-[200px]">
            {log.document.fileName}
          </p>
          <p className="text-micro text-text-tertiary uppercase">
            {log.document.fileType.split("/").pop()}
          </p>
        </div>
      ),
    },
    {
      key: "user",
      label: "Usuário",
      render: (log: ExtractionLogItem) => (
        <span className="text-small text-text-secondary">
          {log.user?.name ?? log.user?.email ?? "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (log: ExtractionLogItem) => (
        <StatusBadge
          label={statusLabel[log.status]}
          variant={statusVariant[log.status]}
        />
      ),
    },
    {
      key: "confidence",
      label: "Confiança",
      render: (log: ExtractionLogItem) => {
        const pct = Math.round(log.confidence * 100);
        const color =
          pct >= 85
            ? "bg-success"
            : pct >= 60
              ? "bg-warning"
              : "bg-danger";
        return (
          <div className="flex items-center gap-[var(--space-2)]">
            <div className="w-[48px] h-[4px] bg-border-light rounded-full overflow-hidden">
              <div
                className={`h-full ${color} rounded-full transition-all duration-300`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-micro font-mono text-text-secondary">
              {formatPercentage(log.confidence)}
            </span>
          </div>
        );
      },
    },
    {
      key: "time",
      label: "Tempo",
      render: (log: ExtractionLogItem) => (
        <span className="text-micro font-mono text-text-tertiary">
          {log.processingTimeMs
            ? formatDuration(log.processingTimeMs)
            : "—"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Data",
      render: (log: ExtractionLogItem) => (
        <span className="text-micro text-text-tertiary">
          {formatDate(new Date(log.createdAt))}
        </span>
      ),
    },
    {
      key: "expand",
      label: "",
      className: "w-[40px]",
      render: (log: ExtractionLogItem) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleExpand(log.id);
          }}
          className="flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-primary hover:bg-primary-bg transition-all duration-150"
        >
          <ChevronDown
            size={14}
            strokeWidth={1.8}
            className={`transition-transform duration-200 ${expandedId === log.id ? "rotate-180" : ""}`}
          />
        </button>
      ),
    },
  ];

  return (
    <AdminTable
      columns={columns}
      data={logs}
      keyExtractor={(log) => log.id}
      emptyMessage="Nenhum log de extração encontrado."
      onRowClick={(log) => onToggleExpand(log.id)}
    />
  );
}
