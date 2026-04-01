"use client";

import { useState } from "react";
import { Sidebar } from "./Sidebar";
import { ChatArea } from "./ChatArea";
import { DataPanel } from "./DataPanel";
import { Activity, FileText, LayoutGrid } from "lucide-react";

export function AppShell() {
  const [dataPanelOpen, setDataPanelOpen] = useState(false);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-secondary">
      {/* Sidebar — hidden on <768px, shown as side panel on md+ */}
      <Sidebar />

      {/* Chat — flex-1, always visible */}
      <ChatArea />

      {/* Data Panel — hidden drawer on <1024px, visible on lg+ */}
      <DataPanel
        open={dataPanelOpen}
        onClose={() => setDataPanelOpen(false)}
      />

      {/* Mobile bottom tab bar (<768px) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 flex items-center justify-around bg-bg-primary/80 backdrop-blur-xl border-t border-border py-[var(--space-2)] pb-[calc(var(--space-2)+env(safe-area-inset-bottom))]">
        <button className="flex flex-col items-center gap-[3px] text-primary">
          <Activity size={18} strokeWidth={1.8} />
          <span className="text-micro font-medium">Chat</span>
        </button>
        <button className="flex flex-col items-center gap-[3px] text-text-tertiary">
          <FileText size={18} strokeWidth={1.8} />
          <span className="text-micro">Docs</span>
        </button>
        <button
          onClick={() => setDataPanelOpen(true)}
          className="flex flex-col items-center gap-[3px] text-text-tertiary"
        >
          <LayoutGrid size={18} strokeWidth={1.8} />
          <span className="text-micro">Dados</span>
        </button>
      </nav>

      {/* Floating button for data panel on small screens (<480px) */}
      <button
        onClick={() => setDataPanelOpen(true)}
        className="sm:hidden fixed bottom-[68px] right-[var(--space-4)] z-30 w-[48px] h-[48px] rounded-full bg-primary text-white shadow-lg flex items-center justify-center hover:shadow-xl active:scale-95 transition-all duration-200"
        aria-label="Abrir painel de dados"
      >
        <LayoutGrid size={18} strokeWidth={1.8} />
      </button>
    </div>
  );
}
