"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

export default function TopBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const pathname = usePathname();

  const isPublicShare = pathname.startsWith("/share/");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push("/search");
    }
  };

  if (isPublicShare) {
    return (
      <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/90 px-4 sm:px-6 backdrop-blur z-20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30">
            F
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-[var(--foreground)]">
              Fathom <span className="text-xs font-normal text-[var(--muted-foreground)]">Public Excerpt</span>
            </span>
            <span className="rounded-full px-1.5 py-0.2 text-[9px] font-mono border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              Zero-Leak
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              alert("Sign in placeholder — evaluation mode.");
            }}
            className="text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition hidden sm:inline"
          >
            Sign in
          </a>
          <Link
            href="/"
            className="rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow-sm shadow-indigo-600/20"
          >
            Launch Fathom Workspace →
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-[var(--border)] bg-[var(--card)]/80 px-4 sm:px-6 backdrop-blur z-20">
      {/* Mobile brand & search input */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <Link href="/" className="md:hidden flex items-center gap-1.5 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white shadow-md shadow-indigo-600/30">
            F
          </div>
          <span className="rounded px-1.5 py-0.5 text-[9px] font-mono font-medium border border-amber-500/30 bg-amber-500/10 text-amber-400">
            beta
          </span>
        </Link>

        <form onSubmit={handleSearch} className="relative flex-1">
          <svg
            className="absolute left-3 top-2.5 h-3.5 w-3.5 text-[var(--muted-foreground)] pointer-events-none"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search meetings & transcripts..."
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--muted)]/60 pl-8 pr-3 py-1.5 text-xs text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
          />
        </form>
      </div>

      <div className="flex items-center gap-3 ml-3">
        {/* Mobile quick nav links */}
        <div className="flex md:hidden items-center gap-1.5 text-xs">
          <Link href="/meetings" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded-lg">
            Calls
          </Link>
          <Link href="/search" className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2 py-1 rounded-lg">
            Search
          </Link>
        </div>

        <span className="text-xs text-[var(--muted-foreground)] hidden lg:inline font-mono">
          Workspace: <strong className="text-[var(--foreground)] font-medium">Acme Product Sync</strong>
        </span>

        {/* Decorative Sign in link */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Sign in placeholder — authentication is not enabled for this evaluation build.");
          }}
          className="text-xs font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] px-2.5 py-1 rounded-lg border border-[var(--border)] hover:bg-[var(--muted)] transition"
        >
          Sign in
        </a>

        <div
          className="h-7 w-7 rounded-full bg-indigo-600/30 text-indigo-400 ring-1 ring-indigo-500/40 flex items-center justify-center text-xs font-semibold shrink-0 cursor-default"
          title="Sheikh Muhammad Khizar (shkkhizar27)"
        >
          SK
        </div>
      </div>
    </header>
  );
}
