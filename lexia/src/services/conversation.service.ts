import { createLogger } from "@/lib/logger";
import { conversationRepository } from "@/repositories/conversation.repository";
import { messageRepository } from "@/repositories/message.repository";
import type { MessageRole } from "@/generated/prisma/client";

const log = createLogger("conversation");

const TITLE_MAX_LENGTH = 50;

export const conversationService = {
  async getUserConversations(userId: string) {
    return conversationRepository.findByUserId(userId);
  },

  async createConversation(userId: string, title?: string) {
    const conversation = await conversationRepository.create({
      userId,
      title,
    });
    log.info({ conversationId: conversation.id }, "Conversation created");
    return conversation;
  },

  async saveMessage(
    conversationId: string,
    role: MessageRole,
    content: string,
  ) {
    await messageRepository.create({ conversationId, role, content });

    if (role === "USER") {
      await this.maybeUpdateTitle(conversationId, content);
    }

    await conversationRepository.touchUpdatedAt(conversationId);
  },

  async maybeUpdateTitle(conversationId: string, content: string) {
    const userMessageCount = await messageRepository.countByRole(
      conversationId,
      "USER",
    );

    if (userMessageCount !== 2) return;

    const title =
      content.length > TITLE_MAX_LENGTH
        ? content.slice(0, TITLE_MAX_LENGTH) + "…"
        : content;

    await conversationRepository.updateTitle(conversationId, title);
    log.debug({ conversationId, title }, "Conversation title updated");
  },

  async getMessages(conversationId: string) {
    const messages =
      await messageRepository.findByConversationId(conversationId);

    return messages.map((m) => ({
      id: m.id,
      role: m.role.toLowerCase() as "user" | "assistant" | "system",
      content: m.content,
      createdAt: m.createdAt,
    }));
  },

  async deleteConversation(conversationId: string) {
    await conversationRepository.delete(conversationId);
    log.info({ conversationId }, "Conversation deleted");
  },

  async renameConversation(conversationId: string, title: string) {
    const trimmed = title.trim();
    if (!trimmed) return;
    await conversationRepository.updateTitle(conversationId, trimmed);
    log.debug({ conversationId, title: trimmed }, "Conversation renamed");
  },
};
