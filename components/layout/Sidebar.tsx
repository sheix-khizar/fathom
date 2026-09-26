"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    href: "/meetings",
    label: "Meetings",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "Search",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  // If on a public share page, hide internal workspace sidebar
  if (pathname.startsWith("/share/")) {
    return null;
  }

  return (
    <aside className="w-60 shrink-0 border-r border-[var(--border)] bg-[var(--card)] p-4 hidden md:flex flex-col justify-between shadow-lg">
      <div className="space-y-6">
        {/* Brand with Beta Badge */}
        <Link href="/" className="flex items-center gap-2.5 px-2 text-[var(--foreground)] group">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition">
            F
          </div>
          <div className="flex items-center gap-2">
            <div>
              <span className="text-base font-bold tracking-tight">Fathom</span>
              <span className="block text-[9px] uppercase tracking-widest text-indigo-400 font-semibold">
                AI Notetaker
              </span>
            </div>
            <span className="rounded-full px-2 py-0.5 text-[9px] font-mono font-semibold uppercase tracking-wider border border-amber-500/30 bg-amber-500/10 text-amber-400">
              v2 · beta
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <div className="space-y-1">
          <span className="px-2.5 text-[10px] font-mono font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
            Workspace
          </span>
          <nav className="flex flex-col gap-1 pt-1">
            {navItems.map((item) => {
              const isActive =
                item.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between rounded-xl px-3 py-2 text-xs font-medium transition duration-150 ${
                    isActive
                      ? "bg-indigo-600/15 text-indigo-300 font-semibold ring-1 ring-indigo-500/30 shadow-sm"
                      : "text-[var(--muted-foreground)] hover:bg-[var(--muted)] hover:text-[var(--foreground)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={isActive ? "text-indigo-400" : "text-[var(--muted-foreground)]"}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  {isActive && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 shadow-sm shadow-indigo-400" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer: Workspace & Capture Status */}
      <div className="space-y-3">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--muted)]/40 p-3 space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[var(--foreground)]">Capture Pipeline</span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded">
              Ready
            </span>
          </div>
          <p className="text-[10px] text-[var(--muted-foreground)] leading-tight">
            Manual audio/video upload via Gemini 3.8.
          </p>
        </div>

        {/* User profile & Sign in */}
        <div className="flex items-center justify-between px-2 pt-2 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-full bg-indigo-600/30 text-indigo-400 ring-1 ring-indigo-500/40 flex items-center justify-center text-[10px] font-semibold">
              SK
            </div>
            <div className="text-left">
              <span className="block text-[11px] font-medium text-[var(--foreground)] leading-none">
                Acme Workspace
              </span>
              <span className="text-[9px] font-mono text-[var(--muted-foreground)]">
                Local Session
              </span>
            </div>
          </div>
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Sign in placeholder — authentication is not enabled for this evaluation build.");
            }}
            className="text-[10px] font-mono text-indigo-400 hover:text-indigo-300 hover:underline"
          >
            Sign in
          </a>
        </div>
      </div>
    </aside>
  );
}
