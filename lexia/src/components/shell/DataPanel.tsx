"use client";

import { useState, useRef, useEffect } from "react";
import { useAtom } from "jotai";
import { extractionResultAtom, editedFieldsAtom } from "@/store/extraction";
import type { ExtractedField } from "@/shared/schemas/extraction";
import { maskCpf, maskCnpj, isCpfField, isCnpjField } from "@/lib/masking";
import { X, Pencil, Eye, EyeOff, LayoutGrid } from "lucide-react";

const tabs = ["Processo", "Partes", "Voo/Evento"] as const;

// Mapeamento de chaves para labels legíveis
const fieldLabels: Record<string, string> = {
  tipoProcesso: "Tipo de Processo",
  numeroProcesso: "Nº Processo",
  dataDistribuicao: "Data Distribuição",
  vara: "Vara",
  comarca: "Comarca",
  foro: "Foro",
  valorCausa: "Valor da Causa",
  resumoFatos: "Resumo dos Fatos",
  autor: "Autor",
  reu: "Réu",
  cpfAutor: "CPF Autor",
  cnpjAutor: "CNPJ Autor",
  cpfReu: "CPF Réu",
  cnpjReu: "CNPJ Réu",
  advogadoAutor: "Advogado Autor",
  advogadoReu: "Advogado Réu",
  numeroVoo: "Nº Voo",
  codigoIATA: "Código IATA",
  origem: "Origem",
  destino: "Destino",
  dataOcorrencia: "Data Ocorrência",
  tipoOcorrencia: "Tipo de Ocorrência",
  tipoDano: "Tipo de Dano",
};

function ConfidenceBadge({ confidence }: { confidence: number }) {
  const pct = Math.round(confidence * 100);
  let colorClass: string;
  let bgClass: string;

  if (pct >= 85) {
    colorClass = "text-success";
    bgClass = "bg-success";
  } else if (pct >= 60) {
    colorClass = "text-warning";
    bgClass = "bg-warning";
  } else {
    colorClass = "text-danger";
    bgClass = "bg-danger";
  }

  return (
    <div className="flex items-center gap-[6px]">
      <div className="w-[36px] h-[4px] bg-border-light rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${bgClass} transition-all duration-300`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-micro font-mono ${colorClass}`}>{pct}%</span>
    </div>
  );
}

function FieldRow({
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
          <span className="text-micro text-text-tertiary font-medium">{label}</span>
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
              {masked ? <Eye size={14} strokeWidth={1.5} /> : <EyeOff size={14} strokeWidth={1.5} />}
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
          onKeyDown={(e) => { if (e.key === "Enter") setEditing(true); }}
        >
          {displayValue}
        </span>
      )}
    </div>
  );
}

function FieldGroup({
  title,
  groupKey,
  data,
  onEdit,
  editedFields,
}: {
  title: string;
  groupKey: string;
  data: Record<string, ExtractedField | undefined>;
  onEdit: (group: string, field: string, value: string) => void;
  editedFields: Set<string>;
}) {
  const entries = Object.entries(data).filter(
    (entry): entry is [string, ExtractedField] =>
      entry[1] !== undefined && entry[1] !== null,
  );

  if (entries.length === 0) {
    return (
      <div className="py-[var(--space-4)] text-center">
        <p className="text-small text-text-tertiary">
          Nenhum dado de {title.toLowerCase()} encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {entries.map(([key, field]) => (
        <FieldRow
          key={key}
          label={fieldLabels[key] ?? key}
          field={field}
          fieldKey={key}
          groupKey={groupKey}
          onEdit={onEdit}
          isEdited={editedFields.has(`${groupKey}.${key}`)}
        />
      ))}
    </div>
  );
}

export function DataPanel({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Processo");
  const [result, setResult] = useAtom(extractionResultAtom);
  const [editedFields, setEditedFields] = useAtom(editedFieldsAtom);

  const extraction = result?.extraction;
  const totalFields = result?.totalFields ?? 0;
  const avgConfidence = result?.averageConfidence ?? 0;
  const fieldsForReview = result?.fieldsForReview ?? 0;

  const activeGroupKey =
    activeTab === "Processo"
      ? "processo"
      : activeTab === "Partes"
        ? "partes"
        : "vooEvento";

  const activeData =
    activeTab === "Processo"
      ? extraction?.processo
      : activeTab === "Partes"
        ? extraction?.partes
        : extraction?.vooEvento;

  const handleEdit = (group: string, field: string, value: string) => {
    if (!result || !extraction) return;

    const updated = structuredClone(result);
    const groupData = updated.extraction[group as keyof typeof updated.extraction];
    if (groupData && field in groupData) {
      const existing = groupData[field as keyof typeof groupData] as ExtractedField | undefined;
      if (existing) {
        existing.value = value;
        existing.confidence = 1.0;
      }
    }
    setResult(updated);
    setEditedFields((prev: Set<string>) => new Set(prev).add(`${group}.${field}`));
  };

  return (
    <>
      {/* Overlay for drawer mode (<1024px) */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-40 lg:hidden animate-fade-in"
          onClick={onClose}
        />
      )}

      <aside
        className={`
          bg-bg-primary border-l border-border-light h-full flex flex-col
          w-[var(--data-panel-width)] min-w-[var(--data-panel-min)] max-w-[var(--data-panel-max)]
          lg:relative lg:block lg:rounded-tr-[var(--radius-xl)] lg:rounded-br-[var(--radius-xl)]
          fixed right-0 top-0 z-50 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
          ${open ? "translate-x-0" : "translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Panel Header */}
        <div className="flex items-center justify-between px-[var(--space-5)] py-[var(--space-4)] border-b border-border-light shrink-0">
          <h2 className="text-heading text-text-primary">
            Dados Extraídos
          </h2>
          <button
            onClick={onClose}
            className="lg:hidden flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-150"
            aria-label="Fechar painel"
          >
            <X size={16} strokeWidth={1.8} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-[var(--space-1)] px-[var(--space-4)] py-[var(--space-3)] border-b border-border-light shrink-0">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`text-small px-[var(--space-3)] py-[6px] rounded-[var(--radius-md)] transition-all duration-150 ${
                activeTab === tab
                  ? "bg-primary-bg text-primary font-medium shadow-xs"
                  : "text-text-tertiary hover:text-text-secondary hover:bg-bg-tertiary"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Stat Cards */}
        <div className="p-[var(--space-4)] shrink-0">
          <div className="grid grid-cols-3 gap-[var(--space-2)]">
            <div className="bg-bg-secondary rounded-[var(--radius-md)] p-[10px_12px]">
              <span className="text-[18px] font-mono font-semibold text-text-primary block">
                {totalFields}
              </span>
              <span className="text-micro text-text-tertiary">Campos</span>
            </div>
            <div className="bg-bg-secondary rounded-[var(--radius-md)] p-[10px_12px]">
              <span
                className={`text-[18px] font-mono font-semibold block ${
                  avgConfidence >= 0.85
                    ? "text-success"
                    : avgConfidence >= 0.6
                      ? "text-warning"
                      : totalFields > 0
                        ? "text-danger"
                        : "text-text-tertiary"
                }`}
              >
                {totalFields > 0
                  ? `${Math.round(avgConfidence * 100)}%`
                  : "—"}
              </span>
              <span className="text-micro text-text-tertiary">Confiança</span>
            </div>
            <div className="bg-bg-secondary rounded-[var(--radius-md)] p-[10px_12px]">
              <span
                className={`text-[18px] font-mono font-semibold block ${
                  fieldsForReview > 0 ? "text-warning" : "text-text-tertiary"
                }`}
              >
                {totalFields > 0 ? fieldsForReview : "—"}
              </span>
              <span className="text-micro text-text-tertiary">Revisão</span>
            </div>
          </div>
        </div>

        {/* Field Groups — scrollable */}
        <div className="flex-1 overflow-y-auto px-[var(--space-4)] pb-[80px]">
          {extraction && activeData ? (
            <FieldGroup
              title={activeTab}
              groupKey={activeGroupKey}
              data={activeData as Record<string, ExtractedField | undefined>}
              onEdit={handleEdit}
              editedFields={editedFields}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-[var(--space-8)] text-center">
              <div className="w-[40px] h-[40px] rounded-full bg-bg-tertiary flex items-center justify-center mb-[var(--space-3)]">
                <LayoutGrid size={18} strokeWidth={1.8} className="text-text-tertiary" />
              </div>
              <p className="text-small text-text-tertiary">
                Nenhum documento processado ainda.
              </p>
              <p className="text-micro text-text-tertiary mt-[var(--space-1)]">
                Envie um arquivo no chat para extrair dados.
              </p>
            </div>
          )}
        </div>

        {/* Action Row */}
        <div className="absolute bottom-0 left-0 right-0 p-[var(--space-4)] border-t border-border-light bg-bg-primary">
          <div className="flex gap-[var(--space-3)]">
            <button
              className="flex-1 py-[9px] rounded-[var(--radius-md)] border border-border bg-bg-primary text-small font-medium text-text-primary hover:bg-bg-secondary hover:shadow-xs transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!extraction}
            >
              Exportar
            </button>
            <button
              className="flex-1 py-[9px] rounded-[var(--radius-md)] bg-primary text-small font-medium text-white hover:brightness-105 shadow-xs hover:shadow-sm transition-all duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
              disabled={!extraction}
            >
              Enviar ao Karoz
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
