import { formatRelativeTime } from "@/shared/utils/format";
import type { ActivityItem } from "@/app/actions/admin/monitoring";

const actionLabels: Record<string, string> = {
  USER_CREATED: "Usuário criado",
  USER_UPDATED: "Usuário atualizado",
  USER_ACTIVATED: "Usuário ativado",
  USER_DEACTIVATED: "Usuário desativado",
};

const actionIcons: Record<string, string> = {
  USER_CREATED: "●",
  USER_UPDATED: "◐",
  USER_ACTIVATED: "▲",
  USER_DEACTIVATED: "▼",
};

const actionColors: Record<string, string> = {
  USER_CREATED: "text-success",
  USER_UPDATED: "text-primary",
  USER_ACTIVATED: "text-success",
  USER_DEACTIVATED: "text-danger",
};

interface ActivityFeedProps {
  activities: ActivityItem[];
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <div className="bg-bg-primary border border-border rounded-[var(--radius-lg)] p-[var(--space-5)] shadow-xs">
      <h3 className="text-small font-semibold text-text-primary mb-[var(--space-5)]">
        Atividade Recente
      </h3>

      {activities.length === 0 ? (
        <p className="text-small text-text-tertiary text-center py-[var(--space-5)]">
          Nenhuma atividade recente.
        </p>
      ) : (
        <div className="max-h-[300px] overflow-y-auto space-y-[var(--space-1)]">
          {activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-[var(--space-3)] py-[var(--space-3)] border-b border-border-light last:border-b-0"
            >
              <span
                className={`text-micro mt-[2px] ${actionColors[activity.action] ?? "text-text-tertiary"}`}
              >
                {actionIcons[activity.action] ?? "●"}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-small text-text-primary">
                  {actionLabels[activity.action] ?? activity.action}
                </p>
                {activity.userName && (
                  <p className="text-micro text-text-tertiary truncate">
                    por {activity.userName}
                  </p>
                )}
              </div>
              <span className="text-micro text-text-tertiary whitespace-nowrap">
                {formatRelativeTime(new Date(activity.createdAt))}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
