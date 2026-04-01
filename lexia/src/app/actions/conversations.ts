"use server";

import { prisma } from "@/lib/prisma";
import { requireUserId } from "@/lib/auth/guards";

export async function getConversations() {
  const userId = await requireUserId();

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
}

export async function createConversation(title?: string) {
  const userId = await requireUserId();

  const conversation = await prisma.conversation.create({
    data: {
      title: title || "Nova conversa",
      userId,
    },
  });

  return conversation;
}

export async function saveMessage(
  conversationId: string,
  role: "USER" | "ASSISTANT",
  content: string,
) {
  await prisma.message.create({
    data: {
      conversationId,
      role,
      content,
    },
  });

  // Update conversation title from first user message
  if (role === "USER") {
    const messageCount = await prisma.message.count({
      where: { conversationId, role: "USER" },
    });
    if (messageCount === 1) {
      const title = content.length > 50 ? content.slice(0, 50) + "…" : content;
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { title },
      });
    }
  }

  // Touch updatedAt
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() },
  });
}

export async function getConversationMessages(conversationId: string) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" },
  });

  return messages.map((m) => ({
    id: m.id,
    role: m.role.toLowerCase() as "user" | "assistant" | "system",
    content: m.content,
    createdAt: m.createdAt,
  }));
}

export async function deleteConversation(conversationId: string) {
  await requireUserId();
  await prisma.conversation.delete({
    where: { id: conversationId },
  });
}
