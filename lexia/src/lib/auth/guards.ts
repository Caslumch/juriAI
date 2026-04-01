"use server";

import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export async function requireAdmin(): Promise<{
  id: string;
  role: string;
}> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/");
  return { id: session.user.id, role: session.user.role };
}

export async function requireUserId(): Promise<string> {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Não autenticado");
  return session.user.id;
}

export async function getSessionRole(): Promise<string | null> {
  const session = await auth();
  return session?.user?.role ?? null;
}
