"use client";

import { useState } from "react";
import { ActionItem } from "@/lib/supabase/types";

interface EditorialActionItemsProps {
  meetingId: string;
  initialItems: ActionItem[];
  participants: string[];
}

export default function EditorialActionItems({
  meetingId,
  initialItems,
  participants,
}: EditorialActionItemsProps) {
  const [items, setItems] = useState<ActionItem[]>(initialItems);
  const [editingOwnerId, setEditingOwnerId] = useState<string | null>(null);
  const [ownerDraft, setOwnerDraft] = useState<string>("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const completedCount = items.filter(i => i.completed).length;

  const handleToggleComplete = async (item: ActionItem) => {
    const nextCompleted = !item.completed;

    // Optimistic local update
    setItems(prev =>
      prev.map(i => (i.id === item.id ? { ...i, completed: nextCompleted } : i))
    );
    setSavingId(item.id);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/meetings/${meetingId}/action-items/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: nextCompleted }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to update completion status");
      }

      const data = await res.json();
      if (data.actionItem) {
        setItems(prev =>
          prev.map(i => (i.id === item.id ? data.actionItem : i))
        );
      }
    } catch (err: any) {
      console.error("Action item toggle error:", err);
      // Revert optimistic update
      setItems(prev =>
        prev.map(i => (i.id === item.id ? { ...i, completed: item.completed } : i))
      );
      setErrorMessage(err.message || "Failed to persist change.");
    } finally {
      setSavingId(null);
    }
  };

  const handleStartEditOwner = (item: ActionItem) => {
    setEditingOwnerId(item.id);
    setOwnerDraft(item.owner || "");
  };

  const handleSaveOwner = async (itemId: string, newOwner: string | null) => {
    setSavingId(itemId);
    setErrorMessage(null);

    const targetOwner = newOwner && newOwner.trim() ? newOwner.trim() : null;

    // Optimistic update
    setItems(prev =>
      prev.map(i => (i.id === itemId ? { ...i, owner: targetOwner } : i))
    );
    setEditingOwnerId(null);

    try {
      const res = await fetch(`/api/meetings/${meetingId}/action-items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ owner: targetOwner }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to update owner");
      }

      const data = await res.json();
      if (data.actionItem) {
        setItems(prev =>
          prev.map(i => (i.id === itemId ? data.actionItem : i))
        );
      }
    } catch (err: any) {
      console.error("Owner update error:", err);
      setErrorMessage(err.message || "Failed to update owner assignment.");
    } finally {
      setSavingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--border)] bg-[var(--card)]/50 p-12 text-center space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-[var(--foreground)]">No Action Items Extracted</h3>
        <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-md mx-auto leading-relaxed">
          Gemini did not identify explicit action items or commitments for this meeting dialogue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Progress & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-[var(--card)] to-[var(--card)] p-5 sm:p-6 shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-500/15 text-amber-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300">
              Extracted Action Items & Deliverables
            </h3>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            AI owner assignments are editable drafts — click an owner chip to reassign.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-[var(--foreground)]">
            {completedCount} / {items.length} completed
          </span>
          <div className="w-28 h-2.5 bg-[var(--muted)] rounded-full overflow-hidden border border-[var(--border)]">
            <div
              className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${(completedCount / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Action Items List */}
      <div className="divide-y divide-[var(--border)] rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 transition-all duration-150 ${
              item.completed ? "bg-[var(--muted)]/40 opacity-60" : "hover:bg-[var(--muted)]/30"
            }`}
          >
            {/* Checkbox and Text */}
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={item.completed}
                disabled={savingId === item.id}
                onChange={() => handleToggleComplete(item)}
                className="mt-1 h-4 w-4 rounded border-[var(--border)] text-indigo-600 focus:ring-1 focus:ring-indigo-500 cursor-pointer accent-indigo-600 shrink-0"
              />
              <span
                className={`text-sm leading-relaxed transition select-text ${
                  item.completed
                    ? "text-[var(--muted-foreground)] line-through decoration-slate-500"
                    : "text-[var(--foreground)] font-medium"
                }`}
              >
                {item.text}
              </span>
            </div>

            {/* Owner Chip & Editable Draft UI */}
            <div className="flex items-center gap-2 pl-7 sm:pl-0 shrink-0">
              {editingOwnerId === item.id ? (
                <div className="flex items-center gap-1.5 animate-fadeIn">
                  <input
                    type="text"
                    value={ownerDraft}
                    placeholder="Enter name..."
                    autoFocus
                    onChange={(e) => setOwnerDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSaveOwner(item.id, ownerDraft);
                      if (e.key === "Escape") setEditingOwnerId(null);
                    }}
                    className="h-8 w-36 rounded-xl border border-indigo-500 bg-[var(--background)] px-2.5 text-xs text-[var(--foreground)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveOwner(item.id, ownerDraft)}
                    className="h-8 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition shadow-sm cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOwnerId(null)}
                    className="h-8 px-2 rounded-xl border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartEditOwner(item)}
                    className="group/owner inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--muted)]/60 px-3 py-1 text-xs text-[var(--foreground)] hover:border-indigo-500/50 hover:bg-[var(--muted)] transition cursor-pointer shadow-sm"
                    title="Click to edit or reassign owner"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/20 text-[9px] font-bold text-indigo-300">
                      {(item.owner || "U")[0].toUpperCase()}
                    </span>
                    <span className="font-medium text-xs">
                      {item.owner || "Unassigned"}
                    </span>
                    <svg
                      className="h-3 w-3 text-[var(--muted-foreground)] group-hover/owner:text-indigo-400 transition"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.8}
                        d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                      />
                    </svg>
                  </button>

                  {/* Quick participant assignment dropdown if available */}
                  {participants.length > 0 && (
                    <select
                      value=""
                      onChange={(e) => {
                        if (e.target.value) handleSaveOwner(item.id, e.target.value);
                      }}
                      className="h-7 rounded-lg border border-[var(--border)] bg-[var(--muted)]/60 text-[11px] text-[var(--muted-foreground)] px-2 cursor-pointer focus:outline-none hover:text-[var(--foreground)] transition"
                      title="Quick reassign to meeting participant"
                    >
                      <option value="">Reassign...</option>
                      {participants.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
