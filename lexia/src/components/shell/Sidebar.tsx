"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useAtom } from "jotai";
import { useSession } from "next-auth/react";
import { currentConversationAtom } from "@/store/chat";
import { handleSignOut } from "@/app/actions/signout";
import { formatRelativeTime } from "@/shared/utils/format";
import {
  getConversations,
  deleteConversation,
  renameConversation,
} from "@/app/actions/conversations";
import {
  Activity,
  FileText,
  LayoutGrid,
  Clock,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  LogOut,
  Sun,
  Moon,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";
import { themeAtom } from "@/store/theme";

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

function ConversationMenu({
  onRename,
  onDelete,
  onClose,
}: {
  onRename: () => void;
  onDelete: () => void;
  onClose: () => void;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute right-[var(--space-2)] top-[36px] z-50 bg-bg-primary border border-border rounded-[var(--radius-md)] shadow-md py-[var(--space-1)] min-w-[140px] animate-fade-in"
    >
      <button
        onClick={() => {
          onRename();
          onClose();
        }}
        className="w-full flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-[7px] text-small text-text-secondary hover:bg-bg-tertiary transition-colors duration-150"
      >
        <Pencil size={14} strokeWidth={1.8} />
        Renomear
      </button>
      <button
        onClick={() => {
          onDelete();
          onClose();
        }}
        className="w-full flex items-center gap-[var(--space-2)] px-[var(--space-3)] py-[7px] text-small text-danger hover:bg-danger-bg transition-colors duration-150"
      >
        <Trash2 size={14} strokeWidth={1.8} />
        Excluir
      </button>
    </div>
  );
}

export function Sidebar({
  collapsed,
  onToggleCollapse,
}: {
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}) {
  const [activeItem, setActiveItem] = useState("Chat");
  const [currentConversation, setCurrentConversation] = useAtom(
    currentConversationAtom,
  );
  const [theme, setTheme] = useAtom(themeAtom);
  const { data: session } = useSession();

  const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

  const [conversations, setConversations] = useState<ConversationItem[]>([]);
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const renameInputRef = useRef<HTMLInputElement>(null);

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

  useEffect(() => {
    if (renamingId && renameInputRef.current) {
      renameInputRef.current.focus();
      renameInputRef.current.select();
    }
  }, [renamingId]);

  const handleNewChat = () => {
    setCurrentConversation(null);
  };

  const handleSelectConversation = (conv: ConversationItem) => {
    if (renamingId === conv.id) return;
    setCurrentConversation({
      id: conv.id,
      title: conv.title,
      createdAt: conv.updatedAt,
      updatedAt: conv.updatedAt,
      messages: [],
    });
  };

  const handleDeleteConversation = async (convId: string) => {
    await deleteConversation(convId);
    if (currentConversation?.id === convId) {
      setCurrentConversation(null);
    }
    loadConversations();
  };

  const handleStartRename = (conv: ConversationItem) => {
    setRenamingId(conv.id);
    setRenameValue(conv.title);
  };

  const handleConfirmRename = async () => {
    if (!renamingId) return;
    const trimmed = renameValue.trim();
    if (trimmed && trimmed !== conversations.find((c) => c.id === renamingId)?.title) {
      await renameConversation(renamingId, trimmed);
      loadConversations();
    }
    setRenamingId(null);
    setRenameValue("");
  };

  const handleCancelRename = () => {
    setRenamingId(null);
    setRenameValue("");
  };

  return (
    <aside
      className={`hidden md:flex flex-col bg-bg-secondary h-full transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        collapsed
          ? "w-[60px] min-w-[60px] max-w-[60px]"
          : "w-[var(--sidebar-width)] min-w-[var(--sidebar-min)] max-w-[var(--sidebar-max)]"
      }`}
    >
      {/* Logo + Collapse toggle */}
      <div className={`flex items-center py-[var(--space-5)] ${collapsed ? "px-[var(--space-3)] justify-center" : "px-[var(--space-5)] justify-between"}`}>
        {collapsed ? (
          <button
            onClick={onToggleCollapse}
            className="flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary cursor-pointer transition-all duration-150"
            title="Expandir sidebar"
          >
            <PanelLeftOpen size={16} strokeWidth={1.8} />
          </button>
        ) : (
          <>
            <div>
              <h1 className="text-heading font-mono text-primary tracking-tight">
                Lexia
              </h1>
              <span className="text-micro text-text-tertiary font-mono mt-[2px] block">
                OCR Platform
              </span>
            </div>
            <button
              onClick={onToggleCollapse}
              className="flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary cursor-pointer transition-all duration-150"
              title="Colapsar sidebar"
            >
              <PanelLeftClose size={16} strokeWidth={1.8} />
            </button>
          </>
        )}
      </div>

      {/* Navigation */}
      <nav className={`space-y-[2px] ${collapsed ? "px-[var(--space-2)]" : "px-[var(--space-3)]"}`}>
        {navItems.map((item) => (
          <button
            key={item.label}
            onClick={() => setActiveItem(item.label)}
            className={`w-full flex items-center gap-[var(--space-3)] py-[9px] rounded-[var(--radius-md)] text-small cursor-pointer transition-all duration-150 ${
              collapsed ? "justify-center px-0" : "px-[var(--space-3)]"
            } ${
              activeItem === item.label
                ? "bg-primary-bg text-primary font-medium shadow-xs"
                : "text-text-secondary hover:bg-bg-tertiary"
            }`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon
              size={18}
              strokeWidth={1.8}
              className={
                activeItem === item.label ? "opacity-100" : "opacity-60"
              }
            />
            {!collapsed && <span>{item.label}</span>}
          </button>
        ))}

        {session?.user?.role === "ADMIN" && (
          <>
            <div className="border-t border-border-light my-[var(--space-3)]" />
            <a
              href="/admin/users"
              className={`w-full flex items-center gap-[var(--space-3)] py-[9px] rounded-[var(--radius-md)] text-small text-text-secondary hover:bg-bg-tertiary cursor-pointer transition-all duration-150 ${
                collapsed ? "justify-center px-0" : "px-[var(--space-3)]"
              }`}
              title={collapsed ? "Admin" : undefined}
            >
              <Clock size={18} strokeWidth={1.8} className="opacity-60" />
              {!collapsed && <span>Admin</span>}
            </a>
          </>
        )}
      </nav>

      {/* New chat button */}
      <div className={`pt-[var(--space-4)] ${collapsed ? "px-[var(--space-2)]" : "px-[var(--space-3)]"}`}>
        <button
          onClick={handleNewChat}
          className={`w-full flex items-center justify-center gap-[var(--space-2)] py-[9px] rounded-[var(--radius-md)] border border-border bg-bg-primary text-small font-medium text-text-primary hover:shadow-sm hover:border-[var(--color-text-tertiary)] cursor-pointer transition-all duration-150`}
          title={collapsed ? "Nova conversa" : undefined}
        >
          <Plus size={14} strokeWidth={2} />
          {!collapsed && "Nova conversa"}
        </button>
      </div>

      {/* Conversations list — hidden when collapsed */}
      {!collapsed && (
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
                <div key={conv.id} className="group relative">
                  <button
                    onClick={() => handleSelectConversation(conv)}
                    className={`w-full text-left px-[var(--space-3)] py-[9px] rounded-[var(--radius-md)] cursor-pointer transition-all duration-150 ${
                      currentConversation?.id === conv.id
                        ? "bg-primary-bg shadow-xs"
                        : "hover:bg-bg-tertiary"
                    }`}
                  >
                    {renamingId === conv.id ? (
                      <input
                        ref={renameInputRef}
                        type="text"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleConfirmRename();
                          if (e.key === "Escape") handleCancelRename();
                        }}
                        onBlur={handleConfirmRename}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-small font-medium text-text-primary bg-bg-primary border border-primary rounded-[var(--radius-sm)] px-[6px] py-[2px] outline-none"
                      />
                    ) : (
                      <p className="text-small font-medium text-text-primary truncate pr-[28px]">
                        {conv.title}
                      </p>
                    )}
                    <span className="text-micro text-text-tertiary">
                      {formatRelativeTime(conv.updatedAt)}
                    </span>
                  </button>

                  {/* Menu button (3 dots) */}
                  {renamingId !== conv.id && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpenId(
                          menuOpenId === conv.id ? null : conv.id,
                        );
                      }}
                      className="absolute right-[var(--space-2)] top-[9px] hidden group-hover:flex items-center justify-center w-[24px] h-[24px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-text-primary hover:bg-bg-tertiary transition-all duration-150"
                      title="Opções"
                    >
                      <MoreHorizontal size={14} strokeWidth={2} />
                    </button>
                  )}

                  {/* Dropdown menu */}
                  {menuOpenId === conv.id && (
                    <ConversationMenu
                      onRename={() => handleStartRename(conv)}
                      onDelete={() => handleDeleteConversation(conv.id)}
                      onClose={() => setMenuOpenId(null)}
                    />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Spacer when collapsed (push user section to bottom) */}
      {collapsed && <div className="flex-1" />}

      {/* User */}
      <div className={`p-[var(--space-4)] mb-[var(--space-3)] rounded-[var(--radius-md)] bg-bg-primary shadow-xs ${
        collapsed ? "mx-[var(--space-2)]" : "mx-[var(--space-3)]"
      }`}>
        <div className={`flex items-center ${collapsed ? "flex-col gap-[var(--space-2)]" : "gap-[var(--space-3)]"}`}>
          <div className="w-[28px] h-[28px] rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <span className="text-caption font-mono text-primary font-semibold">
              {userInitial}
            </span>
          </div>
          {!collapsed && (
            <span className="text-small text-text-secondary truncate flex-1">
              {userName}
            </span>
          )}
          {!collapsed && (
            <>
              <button
                onClick={toggleTheme}
                className="flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-primary hover:bg-primary-bg cursor-pointer transition-all duration-150"
                title={theme === "dark" ? "Modo claro" : "Modo escuro"}
              >
                {theme === "dark" ? (
                  <Sun size={16} strokeWidth={1.8} />
                ) : (
                  <Moon size={16} strokeWidth={1.8} />
                )}
              </button>
              <form action={handleSignOut}>
                <button
                  type="submit"
                  className="flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-danger hover:bg-danger-bg cursor-pointer transition-all duration-150"
                  title="Sair"
                >
                  <LogOut size={16} strokeWidth={1.8} />
                </button>
              </form>
            </>
          )}
          {collapsed && (
            <button
              onClick={toggleTheme}
              className="flex items-center justify-center w-[28px] h-[28px] rounded-[var(--radius-sm)] text-text-tertiary hover:text-primary hover:bg-primary-bg cursor-pointer transition-all duration-150"
              title={theme === "dark" ? "Modo claro" : "Modo escuro"}
            >
              {theme === "dark" ? (
                <Sun size={16} strokeWidth={1.8} />
              ) : (
                <Moon size={16} strokeWidth={1.8} />
              )}
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
