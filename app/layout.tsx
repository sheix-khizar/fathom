import type { Metadata } from "next";
import WorkspaceShell from "@/components/layout/WorkspaceShell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fathom — AI Meeting Intelligence & Synchronized Notetaker",
  description:
    "Record, transcribe, summarize, and share meeting clips with zero friction. Automatic speech diarization, AI executive overviews, and action items.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[var(--background)] text-[var(--foreground)] antialiased selection:bg-teal-500/20 selection:text-teal-900">
        <WorkspaceShell>{children}</WorkspaceShell>
      </body>
    </html>
  );
}
