import { z } from "zod/v4";

export const createUserSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  email: z.email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
  role: z.enum(["ADMIN", "OPERATOR"]),
});

export const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres").optional(),
  email: z.email("Email inválido").optional(),
  role: z.enum(["ADMIN", "OPERATOR"]).optional(),
  isActive: z.boolean().optional(),
});

export const userFiltersSchema = z.object({
  search: z.string().optional(),
  role: z.enum(["ADMIN", "OPERATOR", "ALL"]).optional(),
  status: z.enum(["ACTIVE", "INACTIVE", "ALL"]).optional(),
  page: z.coerce.number().min(1).default(1),
  perPage: z.coerce.number().min(1).max(100).default(20),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserFilters = z.infer<typeof userFiltersSchema>;
