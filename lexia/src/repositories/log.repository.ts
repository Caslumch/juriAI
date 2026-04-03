import { prisma } from "./base";
import type { Prisma } from "@/generated/prisma/client";

export const logRepository = {
  async create(data: {
    action: string;
    userId?: string;
    metadata?: Record<string, unknown>;
  }) {
    return prisma.log.create({
      data: {
        action: data.action,
        metadata: data.metadata as Prisma.InputJsonValue | undefined,
        ...(data.userId && { user: { connect: { id: data.userId } } }),
      },
    });
  },

  async findRecent(limit: number = 20) {
    const logs = await prisma.log.findMany({
      orderBy: { createdAt: "desc" },
      take: limit,
      select: {
        id: true,
        action: true,
        metadata: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    });

    return logs.map((log) => ({
      id: log.id,
      action: log.action,
      userName: log.user?.name ?? log.user?.email ?? null,
      metadata: log.metadata,
      createdAt: log.createdAt,
    }));
  },
};
