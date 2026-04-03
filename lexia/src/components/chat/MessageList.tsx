"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { UserMessage, AIMessage } from "./MessageBubble";

export function MessageList({
  messages,
  isStreaming = false,
}: {
  messages: UIMessage[];
  isStreaming?: boolean;
}) {
  const bottomRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Scroll ao fundo durante streaming e quando novas mensagens chegam
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Auto-scroll se o usuário está perto do fundo (dentro de 150px)
    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      150;

    if (isNearBottom) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  });

  if (messages.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto p-[var(--space-6)]">
        <div className="flex flex-col items-center justify-center h-full text-center">
          <div className="w-[56px] h-[56px] rounded-[var(--radius-xl)] bg-primary-bg flex items-center justify-center mb-[var(--space-5)]">
            <span className="text-heading font-mono font-semibold text-primary">
              Lx
            </span>
          </div>
          <p className="text-body text-text-secondary max-w-sm leading-relaxed">
            Envie um PDF, imagem ou print de um documento jurídico e eu
            extrairei as informações estruturadas automaticamente.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="flex-1 overflow-y-auto p-[var(--space-6)] space-y-[var(--space-5)]"
    >
      {messages.map((msg, i) => {
        const isLastAssistant =
          msg.role === "assistant" && i === messages.length - 1;

        return msg.role === "user" ? (
          <UserMessage key={msg.id} message={msg} />
        ) : msg.role === "assistant" ? (
          <AIMessage
            key={msg.id}
            message={msg}
            isStreaming={isLastAssistant && isStreaming}
          />
        ) : null;
      })}
      <div ref={bottomRef} />
    </div>
  );
}
