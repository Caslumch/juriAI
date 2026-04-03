"use server";

import { requireUserId } from "@/lib/auth/guards";
import { conversationService } from "@/services/conversation.service";

export async function getConversations() {
  const userId = await requireUserId();
  return conversationService.getUserConversations(userId);
}

export async function createConversation(title?: string) {
  const userId = await requireUserId();
  return conversationService.createConversation(userId, title);
}

export async function saveMessage(
  conversationId: string,
  role: "USER" | "ASSISTANT",
  content: string,
) {
  await conversationService.saveMessage(conversationId, role, content);
}

export async function getConversationMessages(conversationId: string) {
  return conversationService.getMessages(conversationId);
}

export async function deleteConversation(conversationId: string) {
  await requireUserId();
  await conversationService.deleteConversation(conversationId);
}

export async function renameConversation(
  conversationId: string,
  title: string,
) {
  await requireUserId();
  await conversationService.renameConversation(conversationId, title);
}
