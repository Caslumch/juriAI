"use client";

import { useActionState } from "react";
import Link from "next/link";
import { register, type AuthState } from "@/app/actions/auth";

export default function RegisterPage() {
  const [state, formAction, pending] = useActionState<AuthState, FormData>(
    register,
    {},
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-bg-secondary px-[var(--space-4)]">
      <div className="w-full max-w-[400px] space-y-[var(--space-6)]">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-display font-mono text-primary">
            Lexia
          </h1>
          <p className="text-small text-text-tertiary mt-[var(--space-2)]">
            Crie sua conta para começar
          </p>
        </div>

        {/* Card */}
        <div className="bg-bg-primary rounded-[var(--radius-xl)] border border-border p-[var(--space-8)] shadow-sm">
          <form action={formAction} className="space-y-[var(--space-5)]">
            {state.error && (
              <div className="rounded-[var(--radius-md)] bg-danger-bg border border-[var(--border-danger)] px-[var(--space-4)] py-[var(--space-3)]">
                <p className="text-small text-danger">{state.error}</p>
              </div>
            )}

            <div className="space-y-[var(--space-2)]">
              <label
                htmlFor="name"
                className="block text-small font-medium text-text-primary"
              >
                Nome
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                autoComplete="name"
                className="w-full rounded-[var(--radius-md)] border border-border bg-bg-primary px-[var(--space-4)] py-[10px] text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                placeholder="Seu nome completo"
              />
            </div>

            <div className="space-y-[var(--space-2)]">
              <label
                htmlFor="email"
                className="block text-small font-medium text-text-primary"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                className="w-full rounded-[var(--radius-md)] border border-border bg-bg-primary px-[var(--space-4)] py-[10px] text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-[var(--space-2)]">
              <label
                htmlFor="password"
                className="block text-small font-medium text-text-primary"
              >
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="new-password"
                minLength={6}
                className="w-full rounded-[var(--radius-md)] border border-border bg-bg-primary px-[var(--space-4)] py-[10px] text-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all duration-150"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full rounded-[var(--radius-md)] bg-primary px-[var(--space-4)] py-[10px] text-body font-medium text-white hover:brightness-105 shadow-xs hover:shadow-sm disabled:opacity-50 transition-all duration-150"
            >
              {pending ? "Cadastrando..." : "Cadastrar"}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-small text-text-tertiary">
          Já tem uma conta?{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
