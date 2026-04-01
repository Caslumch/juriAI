type BadgeVariant = "success" | "warning" | "danger" | "info" | "neutral";

const styles: Record<BadgeVariant, string> = {
  success: "bg-success-bg text-success",
  warning: "bg-warning-bg text-warning",
  danger: "bg-danger-bg text-danger",
  info: "bg-primary-bg text-primary",
  neutral: "bg-bg-tertiary text-text-secondary",
};

export function StatusBadge({
  label,
  variant,
}: {
  label: string;
  variant: BadgeVariant;
}) {
  return (
    <span
      className={`inline-flex items-center px-[8px] py-[3px] rounded-[var(--radius-pill)] text-micro font-medium ${styles[variant]}`}
    >
      {label}
    </span>
  );
}
