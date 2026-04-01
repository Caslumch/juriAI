"use client";

import { useCallback, useRef, useEffect, useMemo, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useAtom } from "jotai";
import { currentConversationAtom } from "@/store/chat";
import { MessageList } from "@/components/chat/MessageList";
import { ChatInput } from "@/components/chat/ChatInput";
import { TypingIndicator } from "@/components/chat/TypingIndicator";
import { DropZone } from "@/components/chat/DropZone";
import { OcrProgress } from "@/components/chat/OcrProgress";
import { useOcrExtraction } from "@/shared/hooks/useOcrExtraction";
import {
  createConversation,
  getConversationMessages,
} from "@/app/actions/conversations";

// Marker used to identify document messages in the chat
const DOC_MARKER = "[[DOC:";
const DOC_MARKER_END = "]]";

export function formatDocMessage(
  fileName: string,
  provider: string,
  confidence: number,
  ocrText: string,
  userMessage?: string,
): string {
  // Encode document info in a compact marker that won't be displayed
  const meta = `${DOC_MARKER}${fileName}|${provider}|${confidence}${DOC_MARKER_END}`;
  const parts = [meta];
  if (userMessage) parts.push(userMessage);
  parts.push(`\nTranscrição do documento:\n---\n${ocrText}\n---`);
  if (!userMessage) {
    parts.push(
      "\nAnalise este documento jurídico. Identifique e resuma as informações principais.",
    );
  }
  return parts.join("\n");
}

export function parseDocMessage(text: string): {
  isDoc: boolean;
  fileName?: string;
  provider?: string;
  confidence?: number;
  userText?: string;
} {
  if (!text.startsWith(DOC_MARKER)) return { isDoc: false };

  const endIdx = text.indexOf(DOC_MARKER_END);
  if (endIdx === -1) return { isDoc: false };

  const meta = text.slice(DOC_MARKER.length, endIdx);
  const [fileName, provider, confidenceStr] = meta.split("|");

  // Extract user text (between marker end and the transcription block)
  const afterMarker = text.slice(endIdx + DOC_MARKER_END.length);
  const transcriptionIdx = afterMarker.indexOf("\nTranscrição do documento:");
  const userText =
    transcriptionIdx > 0
      ? afterMarker.slice(0, transcriptionIdx).trim()
      : undefined;

  return {
    isDoc: true,
    fileName,
    provider,
    confidence: parseFloat(confidenceStr),
    userText: userText || undefined,
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

  const prevConversationId = useRef(currentConversation?.id ?? null);
  useEffect(() => {
    const prevId = prevConversationId.current;
    const newId = currentConversation?.id ?? null;
    prevConversationId.current = newId;

    if (prevId === newId) return;

    resetOcr();

    if (newId === null) {
      conversationIdRef.current = null;
      setChatInstanceId(crypto.randomUUID());
      return;
    }

    if (conversationIdRef.current === newId && prevId === null) {
      return;
    }

    setChatInstanceId(newId);
    getConversationMessages(newId).then((msgs) => {
      setMessages(
        msgs.map((m) => ({
          id: m.id,
          role: m.role as "user" | "assistant",
          content: m.content,
          parts: [{ type: "text" as const, text: m.content }],
        })),
      );
    });
  }, [currentConversation?.id, setMessages, resetOcr]);

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

      // Text-only message
      if (!file) {
        await ensureConversation();
        sendMessage({ text: content });
        return;
      }

      // Message with file — run OCR first, then send combined
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
      // Drag & drop — send immediately without user text
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
        <MessageList messages={messages} />
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
