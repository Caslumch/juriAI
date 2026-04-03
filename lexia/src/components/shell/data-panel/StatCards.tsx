export function StatCards({
  totalFields,
  avgConfidence,
  fieldsForReview,
}: {
  totalFields: number;
  avgConfidence: number;
  fieldsForReview: number;
}) {
  return (
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
          {totalFields > 0 ? `${Math.round(avgConfidence * 100)}%` : "\u2014"}
        </span>
        <span className="text-micro text-text-tertiary">Confiança</span>
      </div>
      <div className="bg-bg-secondary rounded-[var(--radius-md)] p-[10px_12px]">
        <span
          className={`text-[18px] font-mono font-semibold block ${
            fieldsForReview > 0 ? "text-warning" : "text-text-tertiary"
          }`}
        >
          {totalFields > 0 ? fieldsForReview : "\u2014"}
        </span>
        <span className="text-micro text-text-tertiary">Revisão</span>
      </div>
    </div>
  );
}
