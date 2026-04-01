"use client";

import { AdminTable } from "@/components/admin/shared";
import { StatusBadge } from "@/components/admin/shared";
import { formatDate } from "@/shared/utils/format";
import type { AdminUserItem } from "@/app/actions/admin/users";
import { Pencil, CircleX, CircleCheck } from "lucide-react";

interface UserTableProps {
  users: AdminUserItem[];
  onEdit: (user: AdminUserItem) => void;
  onToggleActive: (userId: string) => void;
  togglingId: string | null;
}

export function UserTable({
  users,
  onEdit,
  onToggleActive,
  togglingId,
}: UserTableProps) {
  const columns = [
    {
      key: "name",
      label: "Nome",
      render: (user: AdminUserItem) => (
        <div>
          <p className="font-medium text-text-primary">
            {user.name ?? "—"}
          </p>
          <p className="text-micro text-text-tertiary">{user.email}</p>
        </div>
      ),
    },
    {
      key: "role",
      label: "Papel",
      render: (user: AdminUserItem) => (
        <StatusBadge
          label={user.role === "ADMIN" ? "Admin" : "Operador"}
          variant={user.role === "ADMIN" ? "info" : "neutral"}
        />
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (user: AdminUserItem) => (
        <StatusBadge
          label={user.isActive ? "Ativo" : "Inativo"}
          variant={user.isActive ? "success" : "danger"}
        />
      ),
    },
    {
      key: "stats",
      label: "Uso",
      render: (user: AdminUserItem) => (
        <span className="text-micro text-text-tertiary">
          {user._count.documents} docs · {user._count.conversations} conv
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Criado em",
      render: (user: AdminUserItem) => (
        <span className="text-micro text-text-tertiary">
          {formatDate(new Date(user.createdAt))}
        </span>
      ),
    },
    {
      key: "actions",
      label: "",
      className: "w-[100px]",
      render: (user: AdminUserItem) => (
        <div className="flex items-center gap-[var(--space-2)]">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(user);
            }}
            className="flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-primary hover:bg-primary-bg transition-all duration-150"
            title="Editar"
          >
            <Pencil size={14} strokeWidth={1.8} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleActive(user.id);
            }}
            disabled={togglingId === user.id}
            className={`flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] transition-all duration-150 disabled:opacity-40 ${
              user.isActive
                ? "text-text-tertiary hover:text-danger hover:bg-danger-bg"
                : "text-text-tertiary hover:text-success hover:bg-success-bg"
            }`}
            title={user.isActive ? "Desativar" : "Ativar"}
          >
            {user.isActive ? (
              <CircleX size={14} strokeWidth={1.8} />
            ) : (
              <CircleCheck size={14} strokeWidth={1.8} />
            )}
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminTable
      columns={columns}
      data={users}
      keyExtractor={(user) => user.id}
      emptyMessage="Nenhum usuário encontrado."
    />
  );
}
