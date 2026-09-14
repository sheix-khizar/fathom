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
      <header className="flex h-14 items-center justify-between border-b border-gray-800 bg-gray-950/90 px-6 backdrop-blur">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shadow-md">
            F
          </div>
          <span className="text-sm font-bold tracking-tight text-white">
            Fathom <span className="text-xs font-normal text-gray-400">Public Excerpt</span>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
          >
            Launch Fathom Workspace →
          </Link>
        </div>
      </header>
    );
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-800 bg-gray-950/80 px-4 sm:px-6 backdrop-blur">
      {/* Mobile brand & search input */}
      <div className="flex items-center gap-3 flex-1 max-w-lg">
        <Link href="/" className="md:hidden flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 font-bold text-white shrink-0">
          F
        </Link>

        <form onSubmit={handleSearch} className="relative flex-1">
          <svg
            className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-500 pointer-events-none"
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
            className="w-full rounded-lg border border-gray-800 bg-gray-900/90 pl-8 pr-3 py-1.5 text-xs text-gray-200 placeholder-gray-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition shadow-inner"
          />
        </form>
      </div>

      <div className="flex items-center gap-3 ml-3">
        {/* Mobile quick nav links */}
        <div className="flex md:hidden items-center gap-1.5 text-xs">
          <Link href="/meetings" className="text-gray-400 hover:text-white px-1.5 py-1">
            Calls
          </Link>
          <Link href="/calendar" className="text-gray-400 hover:text-white px-1.5 py-1">
            Cal
          </Link>
        </div>

        <span className="text-xs text-gray-500 hidden lg:inline">
          Workspace: <strong className="text-gray-300 font-medium">Acme Product Sync</strong>
        </span>

        <div
          className="h-7 w-7 rounded-full bg-indigo-600/30 text-indigo-400 ring-1 ring-indigo-500/40 flex items-center justify-center text-xs font-semibold shrink-0"
          title="Sheikh Muhammad Khizar (shkkhizar27)"
        >
          SK
        </div>
      </div>
    </header>
  );
}
