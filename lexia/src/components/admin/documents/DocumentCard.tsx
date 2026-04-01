import { StatusBadge } from "@/components/admin/shared";
import { formatFileSize, formatDate } from "@/shared/utils/format";
import type { DocumentItem } from "@/app/actions/admin/documents";
import { FileText, Image } from "lucide-react";

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

interface DocumentCardProps {
  document: DocumentItem;
  onClick: () => void;
}

export function DocumentCard({ document: doc, onClick }: DocumentCardProps) {
  const isPdf = doc.fileType === "application/pdf";

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-bg-primary border border-border rounded-[var(--radius-lg)] p-[var(--space-5)] hover:shadow-md hover:border-[var(--color-text-tertiary)] transition-all duration-200 shadow-xs"
    >
      <div className="flex items-start gap-[var(--space-4)]">
        {/* File icon */}
        <div
          className={`w-[44px] h-[44px] rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${
            isPdf ? "bg-danger-bg" : "bg-primary-bg"
          }`}
        >
          {isPdf ? (
            <FileText size={20} strokeWidth={1.5} className="text-danger" />
          ) : (
            <Image size={20} strokeWidth={1.5} className="text-primary" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-small font-medium text-text-primary truncate">
            {doc.fileName}
          </p>
          <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-1)]">
            <span className="text-micro text-text-tertiary">
              {formatFileSize(doc.fileSize)}
            </span>
            <span className="text-micro text-border">·</span>
            <span className="text-micro text-text-tertiary">
              {doc.user.name ?? doc.user.email}
            </span>
          </div>
          <div className="flex items-center gap-[var(--space-2)] mt-[var(--space-3)]">
            {doc.latestExtraction && (
              <StatusBadge
                label={statusLabel[doc.latestExtraction.status]}
                variant={statusVariant[doc.latestExtraction.status]}
              />
            )}
            <span className="text-micro text-text-tertiary">
              {formatDate(new Date(doc.createdAt))}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}
