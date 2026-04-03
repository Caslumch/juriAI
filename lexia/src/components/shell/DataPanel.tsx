"use client";

import { useState } from "react";
import { useAtom } from "jotai";
import { extractionResultAtom, editedFieldsAtom } from "@/store/extraction";
import type { ExtractedField } from "@/shared/schemas/extraction";
import { FieldGroup } from "./data-panel/FieldGroup";
import { StatCards } from "./data-panel/StatCards";
import { X, LayoutGrid, PanelRightOpen, PanelRightClose } from "lucide-react";

const tabs = ["Processo", "Partes", "Voo/Evento"] as const;

const tabGroupKeyMap: Record<(typeof tabs)[number], string> = {
  Processo: "processo",
  Partes: "partes",
  "Voo/Evento": "vooEvento",
};

export function DataPanel({
  open,
  onClose,
  collapsed,
  onToggleCollapse,
}: {
  open?: boolean;
  onClose?: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]>("Processo");
  const [result, setResult] = useAtom(extractionResultAtom);
  const [editedFields, setEditedFields] = useAtom(editedFieldsAtom);

  const extraction = result?.extraction;
  const totalFields = result?.totalFields ?? 0;
  const avgConfidence = result?.averageConfidence ?? 0;
  const fieldsForReview = result?.fieldsForReview ?? 0;

  const activeGroupKey = tabGroupKeyMap[activeTab];
  const activeData = extraction?.[activeGroupKey as keyof typeof extraction];

  const handleEdit = (group: string, field: string, value: string) => {
    if (!result || !extraction) return;

    const updated = structuredClone(result);
    const groupData =
      updated.extraction[group as keyof typeof updated.extraction];
    if (groupData && field in groupData) {
      const existing = groupData[
        field as keyof typeof groupData
      ] as ExtractedField | undefined;
      if (existing) {
        existing.value = value;
        existing.confidence = 1.0;
      }
    }
    setResult(updated);
    setEditedFields(
      (prev: Set<string>) => new Set(prev).add(`${group}.${field}`),
    );
  };

  // Collapsed desktop view — thin strip with expand button
  if (collapsed) {
    return (
      <aside className="hidden lg:flex flex-col items-center bg-bg-primary border-l border-border-light h-full w-[48px] min-w-[48px] py-[var(--space-4)] transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]">
        <button
          onClick={onToggleCollapse}
          className="flex items-center justify-center w-[32px] h-[32px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary cursor-pointer transition-all duration-150"
          title="Expandir painel de dados"
        >
          <PanelRightOpen size={16} strokeWidth={1.8} />
        </button>
        <div className="mt-[var(--space-4)] flex flex-col items-center gap-[var(--space-2)]">
          <div
            className="w-[32px] h-[32px] rounded-[var(--radius-sm)] bg-bg-tertiary flex items-center justify-center cursor-pointer hover:bg-primary-bg transition-all duration-150"
            title="Dados Extraídos"
            onClick={onToggleCollapse}
          >
            <LayoutGrid size={16} strokeWidth={1.8} className="text-text-tertiary" />
          </div>
        </div>
        {extraction && (
          <div className="mt-[var(--space-3)] flex flex-col items-center gap-[var(--space-1)]">
            <div
              className="w-[8px] h-[8px] rounded-full bg-success"
              title={`${totalFields} campos extraídos`}
            />
          </div>
        )}
      </aside>
    );
  }

  return (
    <>
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
        {/* Header */}
        <div className="flex items-center justify-between px-[var(--space-5)] py-[var(--space-4)] border-b border-border-light shrink-0">
          <h2 className="text-heading text-text-primary">Dados Extraídos</h2>
          <div className="flex items-center gap-[var(--space-1)]">
            {/* Collapse button — desktop only */}
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-150"
              title="Colapsar painel"
            >
              <PanelRightClose size={16} strokeWidth={1.8} />
            </button>
            {/* Close button — mobile only */}
            <button
              onClick={onClose}
              className="lg:hidden flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-150"
              aria-label="Fechar painel"
            >
              <X size={16} strokeWidth={1.8} />
            </button>
          </div>
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

        {/* Stats */}
        <div className="p-[var(--space-4)] shrink-0">
          <StatCards
            totalFields={totalFields}
            avgConfidence={avgConfidence}
            fieldsForReview={fieldsForReview}
          />
        </div>

        {/* Fields */}
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
                <LayoutGrid
                  size={18}
                  strokeWidth={1.8}
                  className="text-text-tertiary"
                />
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

        {/* Actions */}
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
