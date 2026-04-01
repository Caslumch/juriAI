"use client";

import { useState, useEffect } from "react";
import { getExtractionDetail, type ExtractionDetail } from "@/app/actions/admin/logs";
import { formatFileSize, formatDuration } from "@/shared/utils/format";
import { StatusBadge } from "@/components/admin/shared";
import { X } from "lucide-react";

interface LogDetailProps {
  extractionId: string;
  onClose: () => void;
}

const statusVariant: Record<string, "warning" | "info" | "success" | "danger"> = {
  PENDING: "warning",
  PROCESSING: "info",
  COMPLETED: "success",
  FAILED: "danger",
};

const statusLabel: Record<string, string> = {
  PENDING: "Pendente",
  PROCESSING: "Processando",
  COMPLETED: "Concluído",
  FAILED: "Falhou",
};

export function LogDetail({ extractionId, onClose }: LogDetailProps) {
  const [detail, setDetail] = useState<ExtractionDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getExtractionDetail(extractionId)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [extractionId]);

  if (loading) {
    return (
      <div className="py-[var(--space-5)] text-center text-small text-text-tertiary">
        Carregando detalhes...
      </div>
    );
  }

  if (!detail) {
    return (
      <div className="py-[var(--space-5)] text-center text-small text-danger">
        Extração não encontrada.
      </div>
    );
  }

  return (
    <div className="border border-border rounded-[var(--radius-lg)] bg-bg-secondary p-[var(--space-5)] mt-[var(--space-3)] shadow-xs animate-slide-up">
      <div className="flex items-center justify-between mb-[var(--space-4)]">
        <div className="flex items-center gap-[var(--space-3)]">
          <h3 className="text-small font-semibold text-text-primary">
            {detail.document.fileName}
          </h3>
          <StatusBadge
            label={statusLabel[detail.status]}
            variant={statusVariant[detail.status]}
          />
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-150"
        >
          <X size={14} strokeWidth={1.8} />
        </button>
      </div>

      <div className="flex gap-[var(--space-4)] mb-[var(--space-4)] text-micro text-text-tertiary">
        <span>Tamanho: {formatFileSize(detail.document.fileSize)}</span>
        <span>Confiança: {Math.round(detail.confidence * 100)}%</span>
        {detail.processingTimeMs && (
          <span>Tempo: {formatDuration(detail.processingTimeMs)}</span>
        )}
      </div>

      <div className="bg-bg-primary rounded-[var(--radius-md)] border border-border p-[var(--space-4)] max-h-[400px] overflow-y-auto">
        <pre className="text-micro font-mono text-text-secondary whitespace-pre-wrap break-words">
          {JSON.stringify(detail.data, null, 2)}
        </pre>
      </div>
    </div>
  );
}

export { statusVariant, statusLabel };
