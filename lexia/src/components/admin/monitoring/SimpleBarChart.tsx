import { formatShortDate } from "@/shared/utils/format";

interface DataPoint {
  date: string;
  count: number;
}

interface SimpleBarChartProps {
  data: DataPoint[];
  label: string;
  color?: string;
}

export function SimpleBarChart({
  data,
  label,
  color = "bg-primary",
}: SimpleBarChartProps) {
  const max = Math.max(...data.map((d) => d.count), 1);

  return (
    <div className="bg-bg-primary border border-border rounded-[var(--radius-lg)] p-[var(--space-5)] shadow-xs">
      <h3 className="text-small font-semibold text-text-primary mb-[var(--space-5)]">
        {label}
      </h3>

      {data.length === 0 ? (
        <div className="h-[160px] flex items-center justify-center text-small text-text-tertiary">
          Sem dados para o período.
        </div>
      ) : (
        <div className="flex items-end gap-[3px] h-[160px]">
          {data.map((point) => (
            <div
              key={point.date}
              className="flex-1 flex flex-col items-center justify-end h-full"
            >
              <div
                className={`w-full ${color} rounded-t-[var(--radius-sm)] min-h-[3px] transition-all duration-300`}
                style={{
                  height: `${(point.count / max) * 100}%`,
                }}
                title={`${point.date}: ${point.count}`}
              />
              {data.length <= 14 && (
                <span className="text-[9px] text-text-tertiary mt-[var(--space-1)] whitespace-nowrap">
                  {formatShortDate(new Date(point.date + "T12:00:00"))}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
