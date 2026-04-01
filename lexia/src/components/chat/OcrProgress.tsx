"use client";

import { useAtomValue } from "jotai";
import { ocrProgressAtom } from "@/store/extraction";
import { Loader2, CircleCheck, CircleX } from "lucide-react";

const statusLabels: Record<string, string> = {
  uploading: "Enviando",
  preprocessing: "Pré-processando",
  ocr: "OCR",
  extracting: "Extraindo",
  done: "Concluído",
  error: "Erro",
};

export function OcrProgress() {
  const { status, progress, message } = useAtomValue(ocrProgressAtom);

  if (status === "idle") return null;

  const isError = status === "error";
  const isDone = status === "done";

  return (
    <div className="flex items-start gap-[var(--space-3)] animate-bubble-in px-[var(--space-6)] pb-[var(--space-3)]">
      {/* Avatar Lx */}
      <div className="w-[28px] h-[28px] rounded-full bg-bg-tertiary flex items-center justify-center shrink-0 mt-[2px]">
        <span className="text-micro font-mono font-semibold text-text-secondary">
          Lx
        </span>
      </div>

      <div className="flex-1 max-w-[400px]">
        <div
          className="bg-bg-secondary px-[var(--space-4)] py-[var(--space-3)] space-y-[var(--space-2)] shadow-xs"
          style={{ borderRadius: "var(--radius-bubble-ai)" }}
        >
          {/* Status label */}
          <div className="flex items-center gap-[var(--space-2)]">
            {!isDone && !isError && (
              <Loader2 size={14} strokeWidth={2} className="animate-spin text-primary" />
            )}
            {isDone && (
              <CircleCheck size={14} strokeWidth={2} className="text-success" />
            )}
            {isError && (
              <CircleX size={14} strokeWidth={2} className="text-danger" />
            )}
            <span
              className={`text-small font-medium ${
                isError
                  ? "text-danger"
                  : isDone
                    ? "text-success"
                    : "text-text-primary"
              }`}
            >
              {statusLabels[status] ?? status}
            </span>
          </div>

          {/* Progress bar */}
          {!isError && (
            <div className="h-[4px] bg-border-light rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ease-out ${
                  isDone ? "bg-success" : "bg-primary"
                }`}
                style={{ width: `${progress}%` }}
              />
            </div>
          )}

          {/* Message */}
          <p
            className={`text-micro ${isError ? "text-danger" : "text-text-tertiary"}`}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
