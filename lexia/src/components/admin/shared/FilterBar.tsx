"use client";

import { Search } from "lucide-react";

interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  action?: React.ReactNode;
}

export function FilterBar({
  searchValue,
  onSearchChange,
  searchPlaceholder = "Buscar...",
  filters,
  action,
}: FilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-[var(--space-3)] mb-[var(--space-5)]">
      <div className="flex-1 min-w-[200px]">
        <div className="relative">
          <Search
            size={16}
            strokeWidth={1.8}
            className="absolute left-[var(--space-4)] top-1/2 -translate-y-1/2 text-text-tertiary"
          />
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-[var(--radius-md)] border border-border bg-bg-primary pl-[var(--space-8)] pr-[var(--space-4)] py-[10px] text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
          />
        </div>
      </div>

      {filters && (
        <div className="flex items-center gap-[var(--space-2)]">{filters}</div>
      )}

      {action && <div>{action}</div>}
    </div>
  );
}

export function FilterSelect({
  value,
  onChange,
  options,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  label?: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      aria-label={label}
      className="rounded-[var(--radius-md)] border border-border bg-bg-primary px-[var(--space-3)] py-[10px] text-body text-text-primary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
}
