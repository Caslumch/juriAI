"use client";

import { useCallback, useRef, useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { UIMessage } from "ai";
import { useAtom } from "jotai";
import { currentConversationAtom } from "@/store/chat";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { DropZone } from "@/components/chat/DropZone";
import { OcrProgress } from "@/components/chat/OcrProgress";
import { useOcrExtraction } from "@/shared/hooks/useOcrExtraction";
import { formatDocMessage } from "@/shared/utils/doc-message";
import {
  createConversation,
  getConversationMessages,
} from "@/app/actions/conversations";

function dbMessageToUI(m: {
  id: string;
  role: string;
  content: string;
}): UIMessage {
  return {
    id: m.id,
    role: m.role as "user" | "assistant",
    parts: [{ type: "text" as const, text: m.content }],
  };
}

export function ChatArea() {
  const [currentConversation, setCurrentConversation] = useAtom(
    currentConversationAtom,
  );
  const { runOcr, runExtraction, reset: resetOcr } = useOcrExtraction();
  const processingRef = useRef(false);
  const conversationIdRef = useRef<string | null>(
    currentConversation?.id ?? null,
  );

  const [chatInstanceId, setChatInstanceId] = useState(() =>
    currentConversation?.id ?? crypto.randomUUID(),
  );

  // Mensagens pendentes para setar após troca de instância
  const pendingMessagesRef = useRef<UIMessage[] | null>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        body: () => ({ conversationId: conversationIdRef.current }),
      }),
    [],
  );

  const { messages, sendMessage, setMessages, status } = useChat({
    id: chatInstanceId,
    transport,
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    conversationIdRef.current = currentConversation?.id ?? null;
  }, [currentConversation?.id]);

  // Quando a instância do chat muda, setar as mensagens pendentes
  useEffect(() => {
    if (pendingMessagesRef.current) {
      setMessages(pendingMessagesRef.current);
      pendingMessagesRef.current = null;
    }
  }, [chatInstanceId, setMessages]);

  const prevConversationId = useRef(currentConversation?.id ?? null);
  useEffect(() => {
    const prevId = prevConversationId.current;
    const newId = currentConversation?.id ?? null;
    prevConversationId.current = newId;

    if (prevId === newId) return;

    resetOcr();

    if (newId === null) {
      conversationIdRef.current = null;
      pendingMessagesRef.current = null;
      setChatInstanceId(crypto.randomUUID());
      return;
    }

    if (conversationIdRef.current === newId && prevId === null) {
      return;
    }

    // Carregar mensagens do banco, guardar como pendentes, trocar instância
    getConversationMessages(newId).then((msgs) => {
      pendingMessagesRef.current = msgs.map(dbMessageToUI);
      setChatInstanceId(newId);
    });
  }, [currentConversation?.id, resetOcr]);

  const ensureConversation = useCallback(async () => {
    if (conversationIdRef.current) return conversationIdRef.current;

    const conv = await createConversation();
    conversationIdRef.current = conv.id;
    setCurrentConversation({
      id: conv.id,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
      messages: [],
    });
    return conv.id;
  }, [setCurrentConversation]);

  const handleSend = useCallback(
    async (content: string, file?: File) => {
      if (processingRef.current) return;

      if (!file) {
        await ensureConversation();
        sendMessage({ text: content });
        return;
      }

      processingRef.current = true;
      try {
        const ocrResult = await runOcr(file);
        if (!ocrResult) return;

        await ensureConversation();

        const chatMessage = formatDocMessage(
          file.name,
          ocrResult.provider,
          ocrResult.confidence,
          ocrResult.text,
          content || undefined,
        );

        sendMessage({ text: chatMessage });

        runExtraction(ocrResult.text);
      } finally {
        processingRef.current = false;
      }
    },
    [sendMessage, runOcr, runExtraction, ensureConversation],
  );

  const handleFileDrop = useCallback(
    async (file: File) => {
      await handleSend("", file);
    },
    [handleSend],
  );

  const title = currentConversation?.title ?? "Nova conversa";

  return (
    <main className="flex-1 flex flex-col min-w-0 h-full bg-bg-primary rounded-tl-[var(--radius-xl)] rounded-bl-[var(--radius-xl)] shadow-sm overflow-hidden">
      <header className="flex items-center justify-between px-[var(--space-6)] py-[var(--space-4)] border-b border-border-light shrink-0">
        <div>
          <h2 className="text-subheading font-semibold text-text-primary">
            {title}
          </h2>
          <span className="text-micro text-text-tertiary">
            {currentConversation
              ? "Conversa ativa"
              : "Envie um documento para começar"}
          </span>
        </div>
      </header>

      <DropZone
        onFileDrop={handleFileDrop}
        disabled={isLoading || processingRef.current}
      >
        <MessageList messages={messages} isStreaming={status === "streaming"} />
        <OcrProgress />
        {status === "submitted" && (
          <div className="px-[var(--space-6)] pb-[var(--space-3)]">
            <TypingIndicator />
          </div>
        )}
      </DropZone>

      <ChatInput
        onSend={handleSend}
        disabled={isLoading || processingRef.current}
      />
    </main>
  );
}
