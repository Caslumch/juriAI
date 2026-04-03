import { prisma } from "./base";

export const conversationRepository = {
  async findByUserId(userId: string) {
    const conversations = await prisma.conversation.findMany({
      where: { userId },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        updatedAt: true,
        messages: {
          take: 1,
          orderBy: { createdAt: "desc" },
          select: { content: true, createdAt: true },
        },
      },
    });

    return conversations.map((c) => ({
      id: c.id,
      title: c.title,
      updatedAt: c.updatedAt,
      lastMessage: c.messages[0]?.content ?? null,
    }));
  },

  async findById(id: string) {
    return prisma.conversation.findUnique({
      where: { id },
      select: { id: true, title: true, userId: true },
    });
  },

  async create(data: { userId: string; title?: string }) {
    return prisma.conversation.create({
      data: {
        title: data.title || "Nova conversa",
        userId: data.userId,
      },
    });
  },

  async updateTitle(id: string, title: string) {
    return prisma.conversation.update({
      where: { id },
      data: { title },
    });
  },

  async touchUpdatedAt(id: string) {
    return prisma.conversation.update({
      where: { id },
      data: { updatedAt: new Date() },
    });
  },

  async delete(id: string) {
    return prisma.conversation.delete({ where: { id } });
  },
};
