"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { useState } from "react";
import { Copy, Check } from "lucide-react";
import type { Components } from "react-markdown";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-[4px] text-micro text-neutral-400 hover:text-neutral-200 transition-colors duration-150"
      aria-label="Copiar código"
    >
      {copied ? (
        <>
          <Check size={13} strokeWidth={1.8} />
          <span>Copiado</span>
        </>
      ) : (
        <>
          <Copy size={13} strokeWidth={1.8} />
          <span>Copiar</span>
        </>
      )}
    </button>
  );
}

function CodeBlock({
  className,
  children,
}: {
  className?: string;
  children: string;
}) {
  const language = className?.replace("language-", "") || "text";
  const code = children.replace(/\n$/, "");

  return (
    <div className="rounded-[var(--radius-lg)] overflow-hidden my-[var(--space-3)] border border-border-light shadow-xs">
      <div className="flex items-center justify-between bg-[#1e1e2e] px-[var(--space-4)] py-[var(--space-2)]">
        <span className="text-micro font-mono text-neutral-400">
          {language}
        </span>
        <CopyButton text={code} />
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language}
        customStyle={{
          margin: 0,
          padding: "var(--space-4)",
          fontSize: "12px",
          lineHeight: "1.6",
          background: "#282a36",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

const components: Components = {
  code({ className, children, ...props }) {
    const isBlock = className?.startsWith("language-");
    if (isBlock) {
      return (
        <CodeBlock className={className}>
          {String(children)}
        </CodeBlock>
      );
    }
    return (
      <code
        className="bg-bg-tertiary text-primary font-mono text-small px-[5px] py-[1px] rounded-[var(--radius-sm)]"
        {...props}
      >
        {children}
      </code>
    );
  },

  pre({ children }) {
    return <>{children}</>;
  },

  p({ children }) {
    return <p className="mb-[var(--space-3)] last:mb-0 leading-[1.65]">{children}</p>;
  },

  h1({ children }) {
    return (
      <h1 className="text-[18px] font-medium text-text-primary mt-[var(--space-4)] mb-[var(--space-2)]">
        {children}
      </h1>
    );
  },

  h2({ children }) {
    return (
      <h2 className="text-[16px] font-medium text-text-primary mt-[var(--space-4)] mb-[var(--space-2)]">
        {children}
      </h2>
    );
  },

  h3({ children }) {
    return (
      <h3 className="text-[14px] font-medium text-text-primary mt-[var(--space-3)] mb-[var(--space-2)]">
        {children}
      </h3>
    );
  },

  ul({ children }) {
    return (
      <ul className="list-disc list-outside ml-[var(--space-5)] mb-[var(--space-3)] space-y-[var(--space-1)]">
        {children}
      </ul>
    );
  },

  ol({ children }) {
    return (
      <ol className="list-decimal list-outside ml-[var(--space-5)] mb-[var(--space-3)] space-y-[var(--space-1)]">
        {children}
      </ol>
    );
  },

  li({ children }) {
    return <li className="text-body leading-[1.65]">{children}</li>;
  },

  blockquote({ children }) {
    return (
      <blockquote className="border-l-[3px] border-primary pl-[var(--space-4)] my-[var(--space-3)] text-text-secondary italic">
        {children}
      </blockquote>
    );
  },

  table({ children }) {
    return (
      <div className="overflow-x-auto my-[var(--space-3)] rounded-[var(--radius-md)] border border-border-light">
        <table className="w-full text-small">{children}</table>
      </div>
    );
  },

  thead({ children }) {
    return <thead className="bg-bg-tertiary">{children}</thead>;
  },

  th({ children }) {
    return (
      <th className="text-left font-medium text-text-primary px-[var(--space-3)] py-[var(--space-2)] border-b border-border-light">
        {children}
      </th>
    );
  },

  td({ children }) {
    return (
      <td className="px-[var(--space-3)] py-[var(--space-2)] border-b border-border-light text-text-primary">
        {children}
      </td>
    );
  },

  hr() {
    return <hr className="border-border-light my-[var(--space-4)]" />;
  },

  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
      >
        {children}
      </a>
    );
  },

  strong({ children }) {
    return <strong className="font-medium text-text-primary">{children}</strong>;
  },
};

export function MarkdownRenderer({ content }: { content: string }) {
  return (
    <div className="markdown-content">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
