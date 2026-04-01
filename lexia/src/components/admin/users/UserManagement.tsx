"use client";

import { useState, useCallback, useEffect } from "react";
import { FilterBar, FilterSelect, Pagination } from "@/components/admin/shared";
import { UserTable } from "./UserTable";
import { UserFormModal } from "./UserFormModal";
import {
  getUsers,
  toggleUserActive,
  type AdminUserItem,
  type UsersResult,
} from "@/app/actions/admin/users";
import { Plus } from "lucide-react";

export function UserManagement() {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<UsersResult | null>(null);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUserItem | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getUsers({
        search: search || undefined,
        role: roleFilter as "ADMIN" | "OPERATOR" | "ALL",
        status: statusFilter as "ACTIVE" | "INACTIVE" | "ALL",
        page,
        perPage: 20,
      });
      setResult(data);
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, statusFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    setPage(1);
  }, [search, roleFilter, statusFilter]);

  const handleEdit = (user: AdminUserItem) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const handleToggleActive = async (userId: string) => {
    setTogglingId(userId);
    try {
      const res = await toggleUserActive(userId);
      if (res.error) {
        alert(res.error);
      } else {
        fetchUsers();
      }
    } finally {
      setTogglingId(null);
    }
  };

  const handleCreate = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const totalPages = result ? Math.ceil(result.total / result.perPage) : 0;

  return (
    <div>
      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar por nome ou email..."
        filters={
          <>
            <FilterSelect
              value={roleFilter}
              onChange={setRoleFilter}
              label="Filtrar por papel"
              options={[
                { value: "ALL", label: "Todos os papéis" },
                { value: "ADMIN", label: "Admin" },
                { value: "OPERATOR", label: "Operador" },
              ]}
            />
            <FilterSelect
              value={statusFilter}
              onChange={setStatusFilter}
              label="Filtrar por status"
              options={[
                { value: "ALL", label: "Todos os status" },
                { value: "ACTIVE", label: "Ativo" },
                { value: "INACTIVE", label: "Inativo" },
              ]}
            />
          </>
        }
        action={
          <button
            onClick={handleCreate}
            className="flex items-center gap-[var(--space-2)] rounded-[var(--radius-md)] bg-primary px-[var(--space-4)] py-[10px] text-body font-medium text-white hover:brightness-105 shadow-xs hover:shadow-sm transition-all duration-150"
          >
            <Plus size={14} strokeWidth={2} />
            Novo Usuário
          </button>
        }
      />

      {loading && !result ? (
        <div className="flex items-center justify-center py-[var(--space-8)]">
          <span className="text-small text-text-tertiary">Carregando...</span>
        </div>
      ) : (
        <>
          {result && (
            <div className="mb-[var(--space-4)]">
              <span className="text-micro text-text-tertiary">
                {result.total} usuário{result.total !== 1 ? "s" : ""} encontrado
                {result.total !== 1 ? "s" : ""}
              </span>
            </div>
          )}

          <UserTable
            users={result?.users ?? []}
            onEdit={handleEdit}
            onToggleActive={handleToggleActive}
            togglingId={togglingId}
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}

      <UserFormModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingUser(null);
        }}
        editingUser={editingUser}
        onSuccess={fetchUsers}
      />
    </div>
  );
}
