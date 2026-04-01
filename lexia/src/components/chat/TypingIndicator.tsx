"use client";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-[var(--space-3)] animate-bubble-in">
      {/* Avatar Lx */}
      <div className="w-[28px] h-[28px] rounded-full bg-bg-tertiary flex items-center justify-center shrink-0 mt-[2px]">
        <span className="text-micro font-mono font-semibold text-text-secondary">
          Lx
        </span>
      </div>

      <div
        className="bg-bg-secondary px-[var(--space-4)] py-[var(--space-3)] flex items-center gap-[7px] shadow-xs"
        style={{ borderRadius: "var(--radius-bubble-ai)" }}
      >
        <span className="typing-dot w-[6px] h-[6px] rounded-full bg-text-tertiary" />
        <span
          className="typing-dot w-[6px] h-[6px] rounded-full bg-text-tertiary"
          style={{ animationDelay: "150ms" }}
        />
        <span
          className="typing-dot w-[6px] h-[6px] rounded-full bg-text-tertiary"
          style={{ animationDelay: "300ms" }}
        />
      </div>
    </div>
  );
}
