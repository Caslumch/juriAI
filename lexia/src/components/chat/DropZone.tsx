"use client";

import { useState, useCallback, useRef, type DragEvent, type ReactNode } from "react";
import { Upload } from "lucide-react";

const ACCEPTED_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
];

interface DropZoneProps {
  children: ReactNode;
  onFileDrop: (file: File) => void;
  disabled?: boolean;
}

export function DropZone({ children, onFileDrop, disabled }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const dragCounterRef = useRef(0);

  const handleDragEnter = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (disabled) return;
      dragCounterRef.current++;
      if (e.dataTransfer.types.includes("Files")) {
        setIsDragging(true);
      }
    },
    [disabled],
  );

  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      dragCounterRef.current = 0;

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (!file) return;

      if (!ACCEPTED_TYPES.includes(file.type)) {
        alert("Formato não suportado. Envie PDF, JPEG, PNG ou WebP.");
        return;
      }

      onFileDrop(file);
    },
    [disabled, onFileDrop],
  );

  return (
    <div
      className="relative flex-1 flex flex-col min-h-0"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {isDragging && (
        <div className="absolute inset-[var(--space-3)] z-20 flex items-center justify-center bg-primary-bg/90 backdrop-blur-sm border-2 border-dashed border-primary rounded-[var(--radius-xl)] pointer-events-none animate-fade-in">
          <div className="flex flex-col items-center gap-[var(--space-3)]">
            <div className="w-[48px] h-[48px] rounded-full bg-primary/10 flex items-center justify-center">
              <Upload size={24} strokeWidth={1.8} className="text-primary" />
            </div>
            <p className="text-body font-medium text-primary">
              Solte o arquivo aqui
            </p>
            <p className="text-small text-text-tertiary">
              PDF, JPEG, PNG ou WebP
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
