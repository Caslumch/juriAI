"use client";

import { useActionState, useEffect } from "react";
import { Modal } from "@/components/admin/shared";
import { createUser, updateUser } from "@/app/actions/admin/users";
import type { ActionState, AdminUserItem } from "@/app/actions/admin/users";

interface UserFormModalProps {
  open: boolean;
  onClose: () => void;
  editingUser: AdminUserItem | null;
  onSuccess: () => void;
}

export function UserFormModal({
  open,
  onClose,
  editingUser,
  onSuccess,
}: UserFormModalProps) {
  const isEditing = !!editingUser;

  const [createState, createAction, createPending] = useActionState<
    ActionState,
    FormData
  >(createUser, {});

  const [updateState, updateAction, updatePending] = useActionState<
    ActionState,
    FormData
  >(updateUser, {});

  const state = isEditing ? updateState : createState;
  const pending = isEditing ? updatePending : createPending;

  useEffect(() => {
    if (state.success) {
      onSuccess();
      onClose();
    }
  }, [state.success, onSuccess, onClose]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? "Editar Usuário" : "Novo Usuário"}
    >
      <form
        action={isEditing ? updateAction : createAction}
        className="space-y-[var(--space-5)]"
      >
        {isEditing && (
          <input type="hidden" name="id" value={editingUser.id} />
        )}

        {state.error && (
          <div className="rounded-[var(--radius-md)] bg-danger-bg border border-[var(--border-danger)] px-[var(--space-4)] py-[var(--space-3)]">
            <p className="text-small text-danger">{state.error}</p>
          </div>
        )}

        <div className="space-y-[var(--space-2)]">
          <label
            htmlFor="user-name"
            className="block text-small font-medium text-text-primary"
          >
            Nome
          </label>
          <input
            id="user-name"
            name="name"
            type="text"
            required
            defaultValue={editingUser?.name ?? ""}
            className="w-full rounded-[var(--radius-md)] border border-border bg-bg-primary px-[var(--space-4)] py-[10px] text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
            placeholder="Nome do usuário"
          />
        </div>

        <div className="space-y-[var(--space-2)]">
          <label
            htmlFor="user-email"
            className="block text-small font-medium text-text-primary"
          >
            Email
          </label>
          <input
            id="user-email"
            name="email"
            type="email"
            required
            defaultValue={editingUser?.email ?? ""}
            className="w-full rounded-[var(--radius-md)] border border-border bg-bg-primary px-[var(--space-4)] py-[10px] text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
            placeholder="email@exemplo.com"
          />
        </div>

        {!isEditing && (
          <div className="space-y-[var(--space-2)]">
            <label
              htmlFor="user-password"
              className="block text-small font-medium text-text-primary"
            >
              Senha
            </label>
            <input
              id="user-password"
              name="password"
              type="password"
              required
              className="w-full rounded-[var(--radius-md)] border border-border bg-bg-primary px-[var(--space-4)] py-[10px] text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
        )}

        <div className="space-y-[var(--space-2)]">
          <label className="block text-small font-medium text-text-primary">
            Papel
          </label>
          <div className="flex gap-[var(--space-3)]">
            {(["OPERATOR", "ADMIN"] as const).map((role) => (
              <label
                key={role}
                className="flex-1 cursor-pointer"
              >
                <input
                  type="radio"
                  name="role"
                  value={role}
                  defaultChecked={
                    editingUser ? editingUser.role === role : role === "OPERATOR"
                  }
                  className="peer sr-only"
                />
                <div className="text-center py-[10px] rounded-[var(--radius-md)] border border-border text-small font-medium text-text-secondary peer-checked:bg-primary-bg peer-checked:border-primary peer-checked:text-primary transition-all duration-150">
                  {role === "ADMIN" ? "Admin" : "Operador"}
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-[var(--space-3)] pt-[var(--space-3)]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-[var(--radius-md)] border border-border px-[var(--space-4)] py-[10px] text-body font-medium text-text-secondary hover:bg-bg-secondary transition-all duration-150"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={pending}
            className="flex-1 rounded-[var(--radius-md)] bg-primary px-[var(--space-4)] py-[10px] text-body font-medium text-white hover:brightness-105 shadow-xs hover:shadow-sm disabled:opacity-50 transition-all duration-150"
          >
            {pending
              ? "Salvando..."
              : isEditing
                ? "Salvar"
                : "Criar Usuário"}
          </button>
        </div>
      </form>
    </Modal>
  );
}
