"use client";

import { useState, useRef, useEffect } from "react";
import { Pencil, Eye, EyeOff } from "lucide-react";
import { maskCpf, maskCnpj, isCpfField, isCnpjField } from "@/lib/masking";
import { ConfidenceBadge } from "./ConfidenceBadge";
import type { ExtractedField } from "@/shared/schemas/extraction";

export function FieldRow({
  label,
  field,
  fieldKey,
  groupKey,
  onEdit,
  isEdited,
}: {
  label: string;
  field: ExtractedField;
  fieldKey: string;
  groupKey: string;
  onEdit: (group: string, field: string, value: string) => void;
  isEdited: boolean;
}) {
  const [editing, setEditing] = useState(false);
  const [masked, setMasked] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLong = field.value.length > 60;

  const isCpf = isCpfField(fieldKey);
  const isCnpj = isCnpjField(fieldKey);
  const hasMask = (isCpf || isCnpj) && masked;

  const displayValue = hasMask
    ? isCpf
      ? maskCpf(field.value)
      : maskCnpj(field.value)
    : field.value;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleSave = () => {
    const newValue = inputRef.current?.value.trim();
    if (newValue && newValue !== field.value) {
      onEdit(groupKey, fieldKey, newValue);
    }
    setEditing(false);
  };

  return (
    <div className="flex flex-col gap-[3px] py-[var(--space-3)] border-b border-border-light last:border-b-0 group/field">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-[6px]">
          <span className="text-micro text-text-tertiary font-medium">
            {label}
          </span>
          {isEdited && (
            <span className="text-primary-light" title="Editado manualmente">
              <Pencil size={10} strokeWidth={1.8} />
            </span>
          )}
        </div>
        <div className="flex items-center gap-[8px]">
          {(isCpf || isCnpj) && (
            <button
              onClick={() => setMasked(!masked)}
              className="text-text-tertiary hover:text-text-secondary transition-colors duration-150"
              title={masked ? "Revelar" : "Ocultar"}
              aria-label={masked ? "Revelar dado" : "Ocultar dado"}
            >
              {masked ? (
                <Eye size={14} strokeWidth={1.5} />
              ) : (
                <EyeOff size={14} strokeWidth={1.5} />
              )}
            </button>
          )}
          <ConfidenceBadge confidence={field.confidence} />
        </div>
      </div>

      {editing ? (
        <div className="flex gap-[6px]">
          <input
            ref={inputRef}
            type="text"
            defaultValue={field.value}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSave();
              if (e.key === "Escape") setEditing(false);
            }}
            onBlur={handleSave}
            className="flex-1 font-mono text-small bg-bg-primary border border-primary rounded-[var(--radius-sm)] px-[8px] py-[4px] text-text-primary outline-none shadow-xs"
          />
        </div>
      ) : (
        <span
          onClick={() => setEditing(true)}
          className={`font-mono text-text-primary cursor-pointer hover:bg-primary-bg rounded-[var(--radius-sm)] px-[4px] -mx-[4px] py-[2px] transition-all duration-150 ${isLong ? "text-micro" : "text-small"}`}
          title="Clique para editar"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter") setEditing(true);
          }}
        >
          {displayValue}
        </span>
      )}
    </div>
  );
}
