"use server";

import { requireAdmin } from "@/lib/auth/guards";
import { createUserSchema, updateUserSchema } from "@/shared/schemas/admin";
import { userService } from "@/services/user.service";
import { AppError } from "@/lib/errors";
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
  return userService.getUsers(filters);
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

  try {
    await userService.createUser(parsed.data, admin.id);
    return { success: true };
  } catch (error) {
    if (error instanceof AppError) return { error: error.message };
    throw error;
  }
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

  try {
    await userService.updateUser(parsed.data, admin.id);
    return { success: true };
  } catch (error) {
    if (error instanceof AppError) return { error: error.message };
    throw error;
  }
}

export async function toggleUserActive(userId: string): Promise<ActionState> {
  const admin = await requireAdmin();

  try {
    await userService.toggleActive(userId, admin.id);
    return { success: true };
  } catch (error) {
    if (error instanceof AppError) return { error: error.message };
    throw error;
  }
}
