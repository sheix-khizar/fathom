"use client";

import { useState } from "react";
import { ActionItem } from "@/lib/types";

interface ActionItemListProps {
  initialItems: ActionItem[];
}

export default function ActionItemList({ initialItems }: ActionItemListProps) {
  const [items, setItems] = useState<ActionItem[]>(initialItems);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, completed: !item.completed } : item
      )
    );
  };

  const completedCount = items.filter((i) => i.completed).length;

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900/60 p-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-gray-800 pb-4 mb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-400">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-amber-400">
            Action Items & Deliverables
          </h3>
        </div>
        <span className="rounded-full bg-gray-800 px-2.5 py-0.5 text-xs font-medium text-gray-400">
          {completedCount} of {items.length} completed
        </span>
      </div>

      <div className="space-y-2.5">
        {items.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`group flex items-start gap-3 rounded-lg border p-3.5 transition cursor-pointer select-none ${
              item.completed
                ? "border-gray-800/60 bg-gray-950/40 opacity-75"
                : "border-gray-800 bg-gray-900/40 hover:border-gray-700 hover:bg-gray-800/40"
            }`}
          >
            <div className="mt-0.5 flex items-center justify-center">
              <input
                type="checkbox"
                checked={item.completed}
                onChange={() => toggleItem(item.id)}
                className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-gray-900 cursor-pointer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p
                className={`text-sm transition ${
                  item.completed
                    ? "text-gray-500 line-through"
                    : "text-gray-200 group-hover:text-white"
                }`}
              >
                {item.title}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded bg-gray-800 px-2 py-0.5 text-[11px] font-medium text-gray-400">
                  <svg className="h-3 w-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {item.owner}
                </span>
                {item.completed && (
                  <span className="text-[11px] text-emerald-400 font-medium">
                    Done
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
