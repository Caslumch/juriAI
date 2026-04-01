"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | "...")[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= page - 1 && i <= page + 1)) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== "...") {
      pages.push("...");
    }
  }

  return (
    <div className="flex items-center justify-center gap-[var(--space-1)] pt-[var(--space-5)]">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="px-[var(--space-3)] py-[6px] rounded-[var(--radius-md)] border border-border text-small text-text-secondary hover:bg-bg-secondary hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
      >
        Anterior
      </button>

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`dots-${i}`} className="px-[var(--space-2)] text-small text-text-tertiary">
            ...
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`min-w-[32px] py-[6px] rounded-[var(--radius-md)] text-small font-medium transition-all duration-150 ${
              p === page
                ? "bg-primary text-white shadow-xs"
                : "text-text-secondary hover:bg-bg-secondary"
            }`}
          >
            {p}
          </button>
        ),
      )}

      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="px-[var(--space-3)] py-[6px] rounded-[var(--radius-md)] border border-border text-small text-text-secondary hover:bg-bg-secondary hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
      >
        Próximo
      </button>
    </div>
  );
}
