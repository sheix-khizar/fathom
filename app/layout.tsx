import type { Metadata } from "next";
import Sidebar from "@/components/layout/Sidebar";
import TopBar from "@/components/layout/TopBar";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fathom — AI Meeting Intelligence & Synchronized Notetaker",
  description:
    "Record, transcribe, summarize, and share meeting clips with zero friction. Automatic speech diarization, AI executive overviews, and action items.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-gray-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200">
        <div className="flex h-screen overflow-hidden">
          <Sidebar />
          <div className="flex flex-1 flex-col overflow-hidden">
            <TopBar />
            <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</main>
          </div>
        </div>
      </body>
    </html>
  );
}
