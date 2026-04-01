interface StatCardProps {
  label: string;
  value: string;
  color?: "primary" | "success" | "warning" | "danger";
}

const colorClasses = {
  primary: "text-primary",
  success: "text-success",
  warning: "text-warning",
  danger: "text-danger",
};

export function StatCard({ label, value, color = "primary" }: StatCardProps) {
  return (
    <div className="bg-bg-primary border border-border rounded-[var(--radius-lg)] p-[var(--space-5)] shadow-xs">
      <span className="text-micro text-text-tertiary font-medium">{label}</span>
      <span
        className={`text-display font-mono block mt-[var(--space-2)] ${colorClasses[color]}`}
      >
        {value}
      </span>
    </div>
  );
}
