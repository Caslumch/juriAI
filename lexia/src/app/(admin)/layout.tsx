import { requireAdmin } from "@/lib/auth/guards";
import { AdminSidebar, AdminHeader } from "@/components/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();

  return (
    <div className="flex h-screen w-full overflow-hidden bg-bg-secondary">
      <AdminSidebar />
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-bg-primary rounded-tl-[var(--radius-xl)] rounded-bl-[var(--radius-xl)] shadow-sm">
        <AdminHeader />
        <main className="flex-1 overflow-y-auto p-[var(--space-8)]">
          {children}
        </main>
      </div>
    </div>
  );
}
