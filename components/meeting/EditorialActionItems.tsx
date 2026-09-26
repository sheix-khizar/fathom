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
      <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-12 text-center space-y-3 card-elevation">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-base font-semibold text-slate-900">No Action Items Extracted</h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
          Gemini did not identify explicit action items or commitments for this meeting dialogue.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Progress & Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 via-white to-white p-5 sm:p-6 card-elevation">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
              <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800">
              Extracted Action Items & Deliverables
            </h3>
          </div>
          <p className="text-xs text-slate-600">
            AI owner assignments are editable drafts — click an owner chip to reassign.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono font-bold text-slate-900">
            {completedCount} / {items.length} completed
          </span>
          <div className="w-28 h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-emerald-600 transition-all duration-300 rounded-full"
              style={{ width: `${(completedCount / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {errorMessage}
        </div>
      )}

      {/* Action Items List */}
      <div className="divide-y divide-slate-100 rounded-3xl border border-slate-200 bg-white card-elevation overflow-hidden">
        {items.map((item) => (
          <div
            key={item.id}
            className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 transition-all duration-150 ${
              item.completed ? "bg-slate-50/70 opacity-60" : "hover:bg-slate-50/70"
            }`}
          >
            {/* Checkbox and Text */}
            <div className="flex items-start gap-3.5 flex-1 min-w-0">
              <input
                type="checkbox"
                checked={item.completed}
                disabled={savingId === item.id}
                onChange={() => handleToggleComplete(item)}
                className="mt-1 h-4 w-4 rounded border-slate-300 text-teal-700 focus:ring-1 focus:ring-teal-600 cursor-pointer accent-teal-700 shrink-0"
              />
              <span
                className={`text-sm leading-relaxed transition select-text ${
                  item.completed
                    ? "text-slate-400 line-through decoration-slate-400"
                    : "text-slate-900 font-medium"
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
                    className="h-8 w-36 rounded-xl border border-teal-600 bg-white px-2.5 text-xs text-slate-900 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleSaveOwner(item.id, ownerDraft)}
                    className="h-8 px-3 rounded-xl bg-teal-700 text-white text-xs font-semibold hover:bg-teal-800 transition shadow-sm cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingOwnerId(null)}
                    className="h-8 px-2 rounded-xl border border-slate-200 text-xs text-slate-500 hover:text-slate-800 transition cursor-pointer"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleStartEditOwner(item)}
                    className="group/owner inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-800 hover:border-teal-500 hover:bg-teal-50/50 transition cursor-pointer shadow-sm"
                    title="Click to edit or reassign owner"
                  >
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-teal-100 text-[9px] font-bold text-teal-800">
                      {(item.owner || "U")[0].toUpperCase()}
                    </span>
                    <span className="font-medium text-xs">
                      {item.owner || "Unassigned"}
                    </span>
                    <svg
                      className="h-3 w-3 text-slate-400 group-hover/owner:text-teal-700 transition"
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
                      className="h-7 rounded-lg border border-slate-200 bg-slate-50 text-[11px] text-slate-600 px-2 cursor-pointer focus:outline-none hover:text-slate-900 transition"
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
