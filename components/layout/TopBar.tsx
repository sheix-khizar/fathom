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
      <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur z-20">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-700 font-bold text-white shadow-sm">
            F
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold tracking-tight text-slate-900">
              Fathom <span className="text-xs font-normal text-slate-500">Public Excerpt</span>
            </span>
            <span className="rounded-full px-2 py-0.5 text-[9px] font-mono border border-teal-200 bg-teal-50 text-teal-700 font-semibold">
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
            className="text-xs text-slate-500 hover:text-slate-900 transition hidden sm:inline"
          >
            Sign in
          </a>
          <Link
            href="/dashboard"
            className="rounded-xl bg-teal-700 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-teal-800 transition shadow-sm"
          >
            Launch Fathom Workspace →
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white/90 px-4 sm:px-6 backdrop-blur z-20">
      {/* Mobile brand & search input */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <Link href="/" className="md:hidden flex items-center gap-1.5 shrink-0">
          <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-teal-700 font-bold text-white shadow-sm">
            F
          </div>
          <span className="rounded px-1.5 py-0.5 text-[9px] font-mono font-medium border border-amber-300 bg-amber-50 text-amber-800">
            beta
          </span>
        </Link>

        <form onSubmit={handleSearch} className="relative flex-1">
          <svg
            className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none"
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
            className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-teal-600 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600/10 transition"
          />
        </form>
      </div>

      <div className="flex items-center gap-3 ml-3">
        {/* Mobile quick nav links */}
        <div className="flex md:hidden items-center gap-1.5 text-xs">
          <Link href="/meetings" className="text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg">
            Calls
          </Link>
          <Link href="/search" className="text-slate-600 hover:text-slate-900 px-2 py-1 rounded-lg">
            Search
          </Link>
        </div>

        <span className="text-xs text-slate-500 hidden lg:inline font-mono">
          Workspace: <strong className="text-slate-800 font-semibold">Acme Product Sync</strong>
        </span>

        {/* Decorative Sign in link */}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault();
            alert("Sign in placeholder — authentication is not enabled for this evaluation build.");
          }}
          className="text-xs font-medium text-slate-600 hover:text-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-100 transition cursor-pointer"
        >
          Sign in
        </a>

        <div
          className="h-7 w-7 rounded-full bg-teal-100 text-teal-800 ring-1 ring-teal-300 flex items-center justify-center text-xs font-bold shrink-0 cursor-default"
          title="Sheikh Muhammad Khizar (shkkhizar27)"
        >
          SK
        </div>
      </div>
    </header>
  );
}
