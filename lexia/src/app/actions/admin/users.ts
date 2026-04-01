"use server";

import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth/guards";
import { createUserSchema, updateUserSchema } from "@/shared/schemas/admin";
import type { UserFilters } from "@/shared/schemas/admin";
import type { Role } from "@/generated/prisma/client";

export type AdminUserItem = {
  id: string;
  name: string | null;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  _count: { documents: number; conversations: number };
};

export type UsersResult = {
  users: AdminUserItem[];
  total: number;
  page: number;
  perPage: number;
};

export type ActionState = {
  error?: string;
  success?: boolean;
};

export async function getUsers(filters: UserFilters): Promise<UsersResult> {
  await requireAdmin();

  const where: Record<string, unknown> = {};

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { email: { contains: filters.search, mode: "insensitive" } },
    ];
  }

  if (filters.role && filters.role !== "ALL") {
    where.role = filters.role;
  }

  if (filters.status && filters.status !== "ALL") {
    where.isActive = filters.status === "ACTIVE";
  }

  const page = filters.page ?? 1;
  const perPage = filters.perPage ?? 20;

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { documents: true, conversations: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * perPage,
      take: perPage,
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total, page, perPage };
}

export async function createUser(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { name, email, password, role } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Este email já está cadastrado" };
  }

  const passwordHash = await hash(password, 12);

  const newUser = await prisma.user.create({
    data: { name, email, passwordHash, role },
  });

  await prisma.log.create({
    data: {
      action: "USER_CREATED",
      userId: admin.id,
      metadata: { targetUserId: newUser.id, email: newUser.email, role },
    },
  });

  return { success: true };
}

export async function updateUser(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const admin = await requireAdmin();

  const parsed = updateUserSchema.safeParse({
    id: formData.get("id"),
    name: formData.get("name") || undefined,
    email: formData.get("email") || undefined,
    role: formData.get("role") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message };
  }

  const { id, ...data } = parsed.data;

  // Check email uniqueness if changing
  if (data.email) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email },
    });
    if (existing && existing.id !== id) {
      return { error: "Este email já está cadastrado" };
    }
  }

  await prisma.user.update({ where: { id }, data });

  await prisma.log.create({
    data: {
      action: "USER_UPDATED",
      userId: admin.id,
      metadata: { targetUserId: id, changes: data },
    },
  });

  return { success: true };
}

export async function toggleUserActive(userId: string): Promise<ActionState> {
  const admin = await requireAdmin();

  if (userId === admin.id) {
    return { error: "Você não pode desativar sua própria conta" };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isActive: true, role: true },
  });

  if (!user) return { error: "Usuário não encontrado" };

  // Prevent deactivating the last active admin
  if (user.isActive && user.role === "ADMIN") {
    const activeAdmins = await prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });
    if (activeAdmins <= 1) {
      return { error: "Não é possível desativar o último administrador ativo" };
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { isActive: !user.isActive },
  });

  await prisma.log.create({
    data: {
      action: user.isActive ? "USER_DEACTIVATED" : "USER_ACTIVATED",
      userId: admin.id,
      metadata: { targetUserId: userId },
    },
  });

  return { success: true };
}
