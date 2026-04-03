export function ConfidenceBadge({ confidence }: { confidence: number }) {
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
