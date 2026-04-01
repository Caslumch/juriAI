"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/admin/shared";
import {
  getDocumentDetail,
  type DocumentDetail,
} from "@/app/actions/admin/documents";
import { formatFileSize, formatDate, formatPercentage } from "@/shared/utils/format";
import { Download } from "lucide-react";

interface DocumentViewerProps {
  documentId: string;
  open: boolean;
  onClose: () => void;
}

export function DocumentViewer({
  documentId,
  open,
  onClose,
}: DocumentViewerProps) {
  const [detail, setDetail] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"preview" | "data">("preview");

  useEffect(() => {
    if (!open || !documentId) return;
    setLoading(true);
    getDocumentDetail(documentId)
      .then(setDetail)
      .finally(() => setLoading(false));
  }, [open, documentId]);

  const fileUrl = `/api/admin/documents/${documentId}`;
  const isPdf = detail?.fileType === "application/pdf";
  const isImage = detail?.fileType.startsWith("image/");

  return (
    <Modal open={open} onClose={onClose} title={detail?.fileName ?? "Documento"}>
      {loading ? (
        <div className="py-[var(--space-8)] text-center text-small text-text-tertiary">
          Carregando documento...
        </div>
      ) : !detail ? (
        <div className="py-[var(--space-8)] text-center text-small text-danger">
          Documento não encontrado.
        </div>
      ) : (
        <div className="space-y-[var(--space-5)]">
          {/* Metadata */}
          <div className="flex flex-wrap gap-[var(--space-3)] text-micro text-text-tertiary">
            <span>{formatFileSize(detail.fileSize)}</span>
            <span className="text-border">·</span>
            <span>{detail.user.name ?? detail.user.email}</span>
            <span className="text-border">·</span>
            <span>{formatDate(new Date(detail.createdAt))}</span>
          </div>

          {/* Tabs */}
          <div className="flex gap-[var(--space-2)] border-b border-border-light">
            <button
              onClick={() => setActiveTab("preview")}
              className={`px-[var(--space-4)] py-[var(--space-3)] text-small font-medium border-b-2 transition-all duration-150 ${
                activeTab === "preview"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-tertiary hover:text-text-secondary"
              }`}
            >
              Visualização
            </button>
            <button
              onClick={() => setActiveTab("data")}
              className={`px-[var(--space-4)] py-[var(--space-3)] text-small font-medium border-b-2 transition-all duration-150 ${
                activeTab === "data"
                  ? "border-primary text-primary"
                  : "border-transparent text-text-tertiary hover:text-text-secondary"
              }`}
            >
              Dados Extraídos ({detail.extractions.length})
            </button>
          </div>

          {/* Content */}
          {activeTab === "preview" && (
            <div className="border border-border rounded-[var(--radius-lg)] overflow-hidden bg-bg-secondary">
              {isPdf ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-[400px]"
                  title={detail.fileName}
                />
              ) : isImage ? (
                <div className="flex items-center justify-center p-[var(--space-5)] max-h-[400px] overflow-auto">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={fileUrl}
                    alt={detail.fileName}
                    className="max-w-full max-h-[380px] object-contain rounded-[var(--radius-md)]"
                  />
                </div>
              ) : (
                <div className="p-[var(--space-5)] text-center text-small text-text-tertiary">
                  Visualização não disponível para este tipo de arquivo.
                </div>
              )}
            </div>
          )}

          {activeTab === "data" && (
            <div className="space-y-[var(--space-3)] max-h-[400px] overflow-y-auto">
              {detail.extractions.length === 0 ? (
                <p className="text-small text-text-tertiary text-center py-[var(--space-5)]">
                  Nenhuma extração disponível.
                </p>
              ) : (
                detail.extractions.map((ext) => (
                  <div
                    key={ext.id}
                    className="border border-border rounded-[var(--radius-md)] bg-bg-primary p-[var(--space-4)]"
                  >
                    <div className="flex items-center justify-between mb-[var(--space-3)]">
                      <div className="flex items-center gap-[var(--space-2)] text-micro text-text-tertiary">
                        <span className="uppercase font-medium">{ext.status}</span>
                        <span className="text-border">·</span>
                        <span>
                          Confiança: {formatPercentage(ext.confidence)}
                        </span>
                      </div>
                      <span className="text-micro text-text-tertiary">
                        {formatDate(new Date(ext.createdAt))}
                      </span>
                    </div>
                    <pre className="text-micro font-mono text-text-secondary whitespace-pre-wrap break-words max-h-[200px] overflow-y-auto">
                      {JSON.stringify(ext.data, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Download button */}
          <div className="flex justify-end">
            <a
              href={fileUrl}
              download={detail.fileName}
              className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-md)] border border-border px-[var(--space-4)] py-[10px] text-body font-medium text-text-secondary hover:bg-bg-secondary hover:shadow-xs transition-all duration-150"
            >
              <Download size={16} strokeWidth={1.8} />
              Download
            </a>
          </div>
        </div>
      )}
    </Modal>
  );
}
