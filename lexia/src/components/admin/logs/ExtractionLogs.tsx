"use client";

import { useState, useCallback, useEffect } from "react";
import { FilterBar, FilterSelect, Pagination } from "@/components/admin/shared";
import { LogsTable } from "./LogsTable";
import { LogDetail } from "./LogDetail";
import { getExtractionLogs, type LogsResult } from "@/app/actions/admin/logs";

export function ExtractionLogs() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<LogsResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getExtractionLogs({
        search: search || undefined,
        status: statusFilter as "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "ALL",
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        page,
        perPage: 20,
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, dateFrom, dateTo, page]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, dateFrom, dateTo]);

  const totalPages = result ? Math.ceil(result.total / result.perPage) : 0;

  return (
    <div>
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome de documento..."
        filters={
          <>
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              label="Filtrar por status"
              options={[
                { value: "ALL", label: "Todos os status" },
                { value: "PENDING", label: "Pendente" },
                { value: "PROCESSING", label: "Processando" },
                { value: "COMPLETED", label: "Concluído" },
                { value: "FAILED", label: "Falhou" },
              ]}
            />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="rounded-[var(--radius-md)] border border-border bg-bg-primary px-[var(--space-3)] py-[10px] text-body text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
              aria-label="Data início"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="rounded-[var(--radius-md)] border border-border bg-bg-primary px-[var(--space-3)] py-[10px] text-body text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
              aria-label="Data fim"
            />
          </>
        }
      />

      {loading && !result ? (
        <div className="flex items-center justify-center py-[var(--space-8)]">
          <span className="text-small text-text-tertiary">Carregando...</span>
        </div>
      ) : (
        <>
          {result && (
            <div className="mb-[var(--space-4)]">
              <span className="text-micro text-text-tertiary">
                {result.total} extração{result.total !== 1 ? "ões" : ""}{" "}
                encontrada{result.total !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <LogsTable
            logs={result?.logs ?? []}
            expandedId={expandedId}
            onToggleExpand={(id) =>
              setExpandedId(expandedId === id ? null : id)
            }
          />

          {expandedId && (
            <LogDetail
              extractionId={expandedId}
              onClose={() => setExpandedId(null)}
            />
          )}

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
}
