"use client";

import { usePathname } from "next/navigation";

const pageTitles: Record<string, string> = {
  "/admin/users": "Gestão de Usuários",
  "/admin/logs": "Logs de Extração",
  "/admin/monitoring": "Monitoramento de Uso",
  "/admin/documents": "Documentos",
};

export function AdminHeader() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Admin";

  return (
    <header className="border-b border-border-light px-[var(--space-8)] py-[var(--space-5)]">
      <div className="flex items-center gap-[var(--space-2)] text-micro text-text-tertiary mb-[var(--space-1)]">
        <span>Admin</span>
        <span className="text-border">/</span>
        <span className="text-text-secondary">{title}</span>
      </div>
      <h1 className="text-display text-text-primary">{title}</h1>
    </header>
  );
}
