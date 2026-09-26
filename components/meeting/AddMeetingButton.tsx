"use client";

import { useState } from "react";
import UploadMeetingModal from "./UploadMeetingModal";

interface AddMeetingButtonProps {
  className?: string;
  variant?: "primary" | "secondary";
}

export default function AddMeetingButton({
  className = "",
  variant = "primary",
}: AddMeetingButtonProps) {
  const [isOpen, setIsOpen] = useState(false);

  const baseStyle =
    variant === "primary"
      ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-sm shadow-indigo-600/20 font-semibold"
      : "border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:bg-[var(--muted)] font-medium";

  return (
    <>
      <button
        type="button"
        id="add-meeting-button"
        onClick={() => setIsOpen(true)}
        className={`inline-flex items-center gap-2 h-9 px-4 rounded-xl text-xs transition ${baseStyle} ${className}`}
      >
        <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M12 4v16m8-8H4" />
        </svg>
        Add meeting
      </button>

      <UploadMeetingModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
