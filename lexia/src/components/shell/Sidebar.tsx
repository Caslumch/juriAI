"use client";

import { useState, useEffect, useCallback } from "react";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { currentConversationAtom } from "@/store/chat";
import { handleSignOut } from "@/app/actions/signout";
import { formatRelativeTime } from "@/shared/utils/format";
import {
  getConversations,
  deleteConversation,
} from "@/app/actions/conversations";
import {
  Activity,
  FileText,
  LayoutGrid,
  Clock,
  Plus,
  X,
  LogOut,
} from "lucide-react";

interface ConversationItem {
  id: string;
  title: string;
  updatedAt: Date;
  lastMessage: string | null;
}

const navItems = [
  { label: "Chat", icon: Activity, href: "/" },
  { label: "Documentos", icon: FileText, href: "/documents" },
  { label: "Extrações", icon: LayoutGrid, href: "/extractions" },
];

export function Sidebar() {
  const [activeItem, setActiveItem] = useState("Chat");
  const [currentConversation, setCurrentConversation] = useAtom(currentConversationAtom);
  const { data: session } = useSession();

  const [conversations, setConversations] = useState<ConversationItem[]>([]);

  const userName = session?.user?.name ?? "Usuário";
  const userInitial = userName.charAt(0).toUpperCase();

  const loadConversations = useCallback(async () => {
    try {
      const convs = await getConversations();
      setConversations(
        convs.map((c) => ({
          id: c.id,
          title: c.title,
          updatedAt: new Date(c.updatedAt),
          lastMessage: c.lastMessage,
        })),
      );
    } catch {
      // silently fail — user may not be authenticated yet
    }
  }, []);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 10_000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const handleNewChat = () => {
    setCurrentConversation(null);
  };

  const handleSelectConversation = (conv: ConversationItem) => {
    setCurrentConversation({
      id: conv.id,
      title: conv.title,
      createdAt: conv.updatedAt,
      updatedAt: conv.updatedAt,
      messages: [],
    });
  };

  const handleDeleteConversation = async (
    e: React.MouseEvent,
    convId: string,
  ) => {
    e.stopPropagation();
    await deleteConversation(convId);
    if (currentConversation?.id === convId) {
      setCurrentConversation(null);
    }
    loadConversations();
  };

  return (
    <aside className="hidden md:flex flex-col bg-bg-secondary w-[var(--sidebar-width)] min-w-[var(--sidebar-min)] max-w-[var(--sidebar-max)] h-full">
      {/* Logo */}
      <div className="px-[var(--space-5)] py-[var(--space-5)]">
        <h1 className="text-heading font-mono text-primary tracking-tight">
          Lexia
        </h1>
        <span className="text-micro text-text-tertiary font-mono mt-[2px] block">
          OCR Platform
        </span>
      </div>

      {/* Navigation */}
      <nav className="px-[var(--space-3)] space-y-[2px]">
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveItem(item.label)}
            className={`w-full flex items-center gap-[var(--space-3)] px-[var(--space-3)] py-[9px] rounded-[var(--radius-md)] text-small transition-all duration-150 ${
              activeItem === item.label
                ? "bg-primary-bg text-primary font-medium shadow-xs"
                : "text-text-secondary hover:bg-bg-tertiary"
            }`}
          >
            <item.icon size={18} strokeWidth={1.8} className={activeItem === item.label ? "opacity-100" : "opacity-60"} />
            <span>{item.label}</span>
          </button>
        ))}

        {session?.user?.role === "ADMIN" && (
          <>
            <div className="border-t border-border-light my-[var(--space-3)]" />
            <a
              href="/admin/users"
              className="w-full flex items-center gap-[var(--space-3)] px-[var(--space-3)] py-[9px] rounded-[var(--radius-md)] text-small text-text-secondary hover:bg-bg-tertiary transition-all duration-150"
            >
              <Clock size={18} strokeWidth={1.8} className="opacity-60" />
              <span>Admin</span>
            </a>
          </>
        )}
      </nav>

      {/* New chat button */}
      <div className="px-[var(--space-3)] pt-[var(--space-4)]">
        <button
          onClick={handleNewChat}
          className="w-full flex items-center justify-center gap-[var(--space-2)] py-[9px] rounded-[var(--radius-md)] border border-border bg-bg-primary text-small font-medium text-text-primary hover:shadow-sm hover:border-[var(--color-text-tertiary)] transition-all duration-150"
        >
          <Plus size={14} strokeWidth={2} />
          Nova conversa
        </button>
      </div>

      {/* Conversations list */}
      <div className="flex-1 overflow-y-auto px-[var(--space-3)] pt-[var(--space-4)]">
        <p className="text-micro text-text-tertiary px-[var(--space-3)] pb-[var(--space-2)] font-medium uppercase tracking-widest">
          Recentes
        </p>

        {conversations.length === 0 ? (
          <p className="text-small text-text-tertiary px-[var(--space-3)] py-[var(--space-4)]">
            Nenhuma conversa ainda.
          </p>
        ) : (
          <div className="space-y-[2px]">
            {conversations.map((conv) => (
              <div
                key={conv.id}
                className="group relative"
              >
                <button
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left px-[var(--space-3)] py-[9px] rounded-[var(--radius-md)] transition-all duration-150 ${
                    currentConversation?.id === conv.id
                      ? "bg-primary-bg shadow-xs"
                      : "hover:bg-bg-tertiary"
                  }`}
                >
                  <p className="text-small font-medium text-text-primary truncate pr-[20px]">
                    {conv.title}
                  </p>
                  <span className="text-micro text-text-tertiary">
                    {formatRelativeTime(conv.updatedAt)}
                  </span>
                </button>
                <button
                  onClick={(e) => handleDeleteConversation(e, conv.id)}
                  className="absolute right-[var(--space-3)] top-[10px] hidden group-hover:flex items-center justify-center w-[20px] h-[20px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-danger hover:bg-danger-bg transition-all duration-150"
                  title="Excluir conversa"
                >
                  <X size={12} strokeWidth={2} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* User */}
      <div className="p-[var(--space-4)] mx-[var(--space-3)] mb-[var(--space-3)] rounded-[var(--radius-md)] bg-bg-primary shadow-xs">
        <div className="flex items-center gap-[var(--space-3)]">
          <div className="w-[28px] h-[28px] rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-caption font-mono text-primary font-semibold">
              {userInitial}
            </span>
          </div>
          <span className="text-small text-text-secondary truncate flex-1">
            {userName}
          </span>
          <form action={handleSignOut}>
            <button
              type="submit"
              className="flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-danger hover:bg-danger-bg transition-all duration-150"
              title="Sair"
            >
              <LogOut size={16} strokeWidth={1.8} />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
