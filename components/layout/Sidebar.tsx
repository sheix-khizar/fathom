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
    href: "/templates",
    label: "Templates",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    href: "/calendar",
    label: "Calendar",
    icon: (
      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
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
    <aside className="w-56 shrink-0 border-r border-gray-800 bg-gray-950 p-4 hidden md:flex flex-col justify-between">
      <div>
        {/* Brand */}
        <Link href="/" className="mb-8 flex items-center gap-2.5 px-2 text-white group">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30 group-hover:bg-indigo-500 transition">
            F
          </div>
          <div>
            <span className="text-base font-bold tracking-tight">Fathom</span>
            <span className="block text-[9px] uppercase tracking-widest text-indigo-400 font-semibold">
              AI Notetaker
            </span>
          </div>
        </Link>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-xs font-medium transition ${
                  isActive
                    ? "bg-indigo-600/15 text-indigo-300 font-semibold ring-1 ring-indigo-500/30 shadow-sm"
                    : "text-gray-400 hover:bg-gray-900 hover:text-gray-200"
                }`}
              >
                <span className={isActive ? "text-indigo-400" : "text-gray-500"}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="rounded-lg border border-gray-800/80 bg-gray-900/40 p-3 space-y-1.5">
        <div className="flex items-center justify-between text-[11px] text-gray-400">
          <span className="font-medium text-gray-300">Bot Status</span>
          <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Auto-Join On
          </span>
        </div>
        <p className="text-[10px] text-gray-500 leading-tight">
          Zoom, Meet & Teams calls automatically recorded and summarized.
        </p>
      </div>
    </aside>
  );
}
