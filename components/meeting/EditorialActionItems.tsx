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
      setErrorMessage(err.message || "Failed to save owner change.");
    } finally {
      setSavingId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--card)] p-12 text-center space-y-3">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--muted)] text-[var(--muted-foreground)]">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
          </svg>
        </div>
        <h3 className="text-base font-medium text-[var(--foreground)]">No Action Items</h3>
        <p className="text-sm text-[var(--muted-foreground)] max-w-md mx-auto">
          No action items or commitments were identified for this meeting.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress & Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
              Extracted Action Items & Deliverables
            </h3>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
            Gemini owner guesses are drafts — click an owner chip to reassign.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-medium text-[var(--foreground)]">
            {completedCount} / {items.length} completed
          </span>
          <div className="w-24 h-2 bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${(completedCount / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-xs text-red-600 dark:text-red-400">
          {errorMessage}
        </div>
      )}

      {/* Action Items List */}
      <div className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-sm overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 transition ${
              item.completed ? "bg-[var(--muted)]/40 opacity-70" : "hover:bg-[var(--muted)]/20"
            }`}
          >
            {/* Checkbox and Text */}
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={item.completed}
                disabled={savingId === item.id}
                onChange={() => handleToggleComplete(item)}
                className="mt-1 h-4 w-4 rounded border-[var(--border)] text-indigo-600 focus:ring-0 focus:ring-offset-0 cursor-pointer accent-indigo-600"
              />
              <span
                className={`text-sm leading-snug transition select-text ${
                  item.completed
                    ? "text-[var(--muted-foreground)] line-through"
                    : "text-[var(--foreground)]"
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
                    className="h-7 w-36 rounded-lg border border-indigo-500 bg-[var(--background)] px-2 text-xs text-[var(--foreground)] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveOwner(item.id, ownerDraft)}
                    className="h-7 px-2 rounded-lg bg-indigo-600 text-white text-xs font-medium hover:bg-indigo-500 transition"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOwnerId(null)}
                    className="h-7 px-1.5 rounded-lg border border-[var(--border)] text-xs text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartEditOwner(item)}
                    className="group/owner inline-flex items-center gap-1.5 rounded-full border border-[var(--border)] bg-[var(--muted)] px-3 py-1 text-xs text-[var(--foreground)] hover:border-indigo-500 transition cursor-pointer"
                    title="Click to edit or reassign owner"
                  >
                    <span className="text-[11px] text-[var(--muted-foreground)]">Owner:</span>
                    <span className="font-medium text-xs">
                      {item.owner || "Unassigned"}
                    </span>
                    <svg
                      className="h-3 w-3 text-[var(--muted-foreground)] group-hover/owner:text-indigo-500 transition"
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
                      className="h-7 rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[11px] text-[var(--muted-foreground)] px-1 cursor-pointer focus:outline-none"
                      title="Quick reassign to participant"
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
