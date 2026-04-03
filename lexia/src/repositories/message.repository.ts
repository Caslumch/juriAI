import { prisma } from "./base";
import type { MessageRole } from "@/generated/prisma/client";

export const messageRepository = {
  async create(data: {
    conversationId: string;
    role: MessageRole;
    content: string;
  }) {
    return prisma.message.create({ data });
  },

  async findByConversationId(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: "asc" },
    });
  },

  async countByRole(conversationId: string, role: MessageRole) {
    return prisma.message.count({
      where: { conversationId, role },
    });
  },
};
