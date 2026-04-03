import { prisma } from "./base";
import type { Role } from "@/generated/prisma/client";

export type UserFilters = {
  search?: string;
  role?: Role | "ALL";
  status?: "ACTIVE" | "INACTIVE" | "ALL";
  page?: number;
  perPage?: number;
};

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  },

  async findByIdSelect(id: string, select: Record<string, boolean>) {
    return prisma.user.findUnique({ where: { id }, select });
  },

  async create(data: {
    name: string;
    email: string;
    passwordHash: string;
    role?: Role;
  }) {
    return prisma.user.create({ data });
  },

  async update(id: string, data: Partial<{ name: string; email: string; role: Role }>) {
    return prisma.user.update({ where: { id }, data });
  },

  async toggleActive(id: string, isActive: boolean) {
    return prisma.user.update({
      where: { id },
      data: { isActive },
    });
  },

  async countActiveAdmins() {
    return prisma.user.count({
      where: { role: "ADMIN", isActive: true },
    });
  },

  async findMany(filters: UserFilters) {
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
  },

  async count(where?: Record<string, unknown>) {
    return prisma.user.count({ where });
  },
};
