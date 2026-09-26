"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";

export default function WorkspaceShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // 1. Landing Page: full-page marketing presentation without app chrome
  if (pathname === "/") {
    return <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">{children}</div>;
  }

  // 2. Public Share Page: public excerpt with dedicated public header
  if (pathname.startsWith("/share/")) {
    return (
      <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        <TopBar />
        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    );
  }

  // 3. Workspace Routes (/dashboard, /meetings, /search, etc.): full dashboard with sidebar & topbar
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)] text-[var(--foreground)]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-[var(--background)]">
          {children}
        </main>
      </div>
    </div>
  );
}
