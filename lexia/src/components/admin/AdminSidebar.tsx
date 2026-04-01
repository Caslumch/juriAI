"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, List, TrendingUp, FileText, ArrowLeft } from "lucide-react";

const navItems = [
  { label: "Usuários", href: "/admin/users", icon: Users },
  { label: "Logs de Extração", href: "/admin/logs", icon: List },
  { label: "Monitoramento", href: "/admin/monitoring", icon: TrendingUp },
  { label: "Documentos", href: "/admin/documents", icon: FileText },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex flex-col bg-bg-secondary w-[var(--sidebar-width)] min-w-[var(--sidebar-min)] max-w-[var(--sidebar-max)] h-full">
      {/* Logo */}
      <div className="px-[var(--space-5)] py-[var(--space-5)]">
        <h1 className="text-heading font-mono text-primary tracking-tight">
          Lexia
        </h1>
        <span className="text-micro text-text-tertiary font-mono mt-[2px] block">
          Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="px-[var(--space-3)] space-y-[2px] flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-[var(--space-3)] px-[var(--space-3)] py-[9px] rounded-[var(--radius-md)] text-small transition-all duration-150 ${
                isActive
                  ? "bg-primary-bg text-primary font-medium shadow-xs"
                  : "text-text-secondary hover:bg-bg-tertiary"
              }`}
            >
              <item.icon size={18} strokeWidth={1.8} className={isActive ? "opacity-100" : "opacity-60"} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Back to chat */}
      <div className="p-[var(--space-4)] mx-[var(--space-3)] mb-[var(--space-3)]">
        <Link
          href="/"
          className="w-full flex items-center gap-[var(--space-3)] px-[var(--space-3)] py-[9px] rounded-[var(--radius-md)] text-small text-text-secondary hover:bg-bg-tertiary transition-all duration-150"
        >
          <ArrowLeft size={16} strokeWidth={1.8} />
          <span>Voltar ao Chat</span>
        </Link>
      </div>
    </aside>
  );
}
