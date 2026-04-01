"use client";

import { useEffect, useRef } from "react";
import type { UIMessage } from "ai";
import { UserMessage, AIMessage } from "./MessageBubble";

export function MessageList({ messages }: { messages: UIMessage[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

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
    <div className="flex-1 overflow-y-auto p-[var(--space-6)] space-y-[var(--space-5)]">
      {messages.map((msg) =>
        msg.role === "user" ? (
          <UserMessage key={msg.id} message={msg} />
        ) : msg.role === "assistant" ? (
          <AIMessage key={msg.id} message={msg} />
        ) : null,
      )}
      <div ref={bottomRef} />
    </div>
  );
}
