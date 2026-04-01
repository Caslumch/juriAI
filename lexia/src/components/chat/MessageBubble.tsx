"use client";

import Image from "next/image";
import type { UIMessage } from "ai";
import { parseDocMessage } from "@/components/shell/ChatArea";
import { FileText } from "lucide-react";

function getTextContent(message: UIMessage): string {
  return message.parts
    .filter((p) => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function getFileParts(message: UIMessage) {
  return message.parts.filter((p) => p.type === "file");
}

function FileBubble({
  name,
  mediaType,
  url,
}: {
  name?: string;
  mediaType: string;
  url: string;
}) {
  const isPdf = mediaType === "application/pdf";
  const isImage = mediaType.startsWith("image/");
  const displayName = name || "arquivo";

  return (
    <div className="bg-bg-primary border border-border rounded-[var(--radius-lg)] overflow-hidden shadow-xs">
      {isImage && (
        <div className="relative w-[240px] h-[180px]">
          <Image
            src={url}
            alt={displayName}
            fill
            className="object-cover"
            unoptimized
          />
        </div>
      )}

      <div className="flex items-center gap-[var(--space-3)] p-[var(--space-3)]">
        <div
          className={`w-[34px] h-[34px] rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${
            isPdf ? "bg-danger-bg text-danger" : "bg-primary-bg text-primary"
          }`}
        >
          <FileText size={16} strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="text-small font-medium text-primary truncate">
            {displayName}
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Compact document bubble — shows file icon + name with tooltip.
 * The full OCR text is hidden from display but sent to the AI.
 */
function DocumentBubble({
  fileName,
  provider,
  confidence,
  userText,
}: {
  fileName: string;
  provider: string;
  confidence: number;
  userText?: string;
}) {
  const isPdf = fileName.toLowerCase().endsWith(".pdf");
  const confidencePct = Math.round(confidence * 100);

  return (
    <div className="flex flex-col items-end gap-[var(--space-2)]">
      {/* Document card */}
      <div
        className="flex items-center gap-[var(--space-3)] bg-bg-primary border border-border rounded-[var(--radius-lg)] px-[var(--space-4)] py-[var(--space-3)] shadow-xs cursor-default"
        title={`${fileName}\nOCR: ${provider} · Confiança: ${confidencePct}%`}
      >
        <div
          className={`w-[32px] h-[32px] rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${
            isPdf ? "bg-danger-bg text-danger" : "bg-primary-bg text-primary"
          }`}
        >
          <FileText size={16} strokeWidth={1.5} />
        </div>
        <div className="min-w-0">
          <p className="text-small font-medium text-text-primary truncate max-w-[200px]">
            {fileName}
          </p>
          <p className="text-micro text-text-tertiary">
            Documento enviado · {provider}
          </p>
        </div>
      </div>

      {/* User text alongside the document */}
      {userText && (
        <div
          className="bg-primary text-white text-body px-[var(--space-4)] py-[var(--space-3)] shadow-xs"
          style={{ borderRadius: "var(--radius-bubble)" }}
        >
          {userText}
        </div>
      )}
    </div>
  );
}

export function UserMessage({ message }: { message: UIMessage }) {
  const text = getTextContent(message);
  const files = getFileParts(message);

  // Check if this is a document message (contains OCR transcription)
  const docInfo = parseDocMessage(text);

  if (docInfo.isDoc) {
    return (
      <div className="flex justify-end animate-bubble-in">
        <DocumentBubble
          fileName={docInfo.fileName!}
          provider={docInfo.provider!}
          confidence={docInfo.confidence!}
          userText={docInfo.userText}
        />
      </div>
    );
  }

  return (
    <div className="flex justify-end animate-bubble-in">
      <div className="max-w-[80%] flex flex-col items-end gap-[var(--space-2)]">
        {files.map((f, i) => (
          <FileBubble
            key={i}
            name={f.filename}
            mediaType={f.mediaType}
            url={f.url}
          />
        ))}
        {text && (
          <div
            className="bg-primary text-white text-body px-[var(--space-4)] py-[var(--space-3)] shadow-xs"
            style={{ borderRadius: "var(--radius-bubble)" }}
          >
            {text}
          </div>
        )}
      </div>
    </div>
  );
}

export function AIMessage({ message }: { message: UIMessage }) {
  const text = getTextContent(message);

  return (
    <div className="flex items-start gap-[var(--space-3)] animate-bubble-in">
      {/* Avatar Lx */}
      <div className="w-[28px] h-[28px] rounded-full bg-bg-tertiary flex items-center justify-center shrink-0 mt-[2px]">
        <span className="text-micro font-mono font-semibold text-text-secondary">
          Lx
        </span>
      </div>

      <div className="max-w-[88%] flex flex-col gap-[3px]">
        <div
          className="bg-bg-secondary text-body text-text-primary px-[var(--space-4)] py-[var(--space-3)] whitespace-pre-wrap shadow-xs"
          style={{ borderRadius: "var(--radius-bubble-ai)" }}
        >
          {text}
        </div>
      </div>
    </div>
  );
}
