"use client";

import { useState, useRef, useCallback, type KeyboardEvent } from "react";
import { Upload, X, FileText } from "lucide-react";

interface ChatInputProps {
  onSend: (content: string, file?: File) => void;
  disabled?: boolean;
}

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState("");
  const [stagedFile, setStagedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    const trimmed = value.trim();
    if (!trimmed && !stagedFile) return;
    if (disabled) return;

    onSend(trimmed, stagedFile ?? undefined);
    setValue("");
    setStagedFile(null);
  }, [value, stagedFile, disabled, onSend]);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      alert("Formato não suportado. Envie PDF, JPEG, PNG ou WebP.");
      return;
    }
    if (file.size > MAX_FILE_SIZE) {
      alert("Arquivo muito grande. Máximo: 10MB.");
      return;
    }

    setStagedFile(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeStagedFile = () => {
    setStagedFile(null);
  };

  const isPdf = stagedFile?.type === "application/pdf";

  return (
    <div className="px-[var(--space-5)] py-[var(--space-4)] border-t border-border-light bg-bg-primary">
      {/* Staged file preview */}
      {stagedFile && (
        <div className="flex items-center gap-[var(--space-3)] mb-[var(--space-3)] px-[var(--space-2)]">
          <div
            className={`w-[32px] h-[32px] rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${
              isPdf ? "bg-danger-bg text-danger" : "bg-primary-bg text-primary"
            }`}
          >
            <FileText size={16} strokeWidth={1.5} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-small font-medium text-text-primary truncate">
              {stagedFile.name}
            </p>
            <p className="text-micro text-text-tertiary">
              {formatSize(stagedFile.size)}
            </p>
          </div>
          <button
            onClick={removeStagedFile}
            className="flex items-center justify-center w-[24px] h-[24px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-danger hover:bg-danger-bg transition-all duration-150"
            title="Remover arquivo"
          >
            <X size={14} strokeWidth={1.8} />
          </button>
        </div>
      )}

      <div className="flex items-end gap-[var(--space-2)] bg-bg-secondary rounded-[var(--radius-lg)] p-[var(--space-3)] shadow-xs">
        {/* Upload button */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className={`flex items-center justify-center w-[36px] h-[36px] rounded-[var(--radius-md)] transition-all duration-150 ${
            stagedFile
              ? "text-primary bg-primary-bg"
              : "text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary"
          }`}
          aria-label="Upload arquivo"
        >
          <Upload size={18} strokeWidth={1.8} />
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          className="hidden"
          onChange={handleFileChange}
        />

        {/* Text input */}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            stagedFile
              ? "Adicione uma mensagem ou clique Enviar..."
              : "Digite sua mensagem..."
          }
          rows={1}
          className="flex-1 bg-transparent text-body text-text-primary placeholder:text-text-tertiary outline-none resize-none max-h-[120px]"
          style={{ fieldSizing: "content" } as React.CSSProperties}
          disabled={disabled}
        />

        {/* Send button */}
        <button
          type="button"
          onClick={handleSend}
          disabled={(!value.trim() && !stagedFile) || disabled}
          className="flex items-center justify-center h-[36px] px-[var(--space-4)] rounded-[var(--radius-md)] bg-primary text-white text-small font-medium hover:brightness-105 shadow-xs hover:shadow-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Enviar
        </button>
      </div>
    </div>
  );
}
