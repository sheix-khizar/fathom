import Link from "next/link";
import { getMeetingById } from "@/lib/data/meetings";
import MeetingDetailClient from "@/components/meeting/MeetingDetailClient";

interface MeetingPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ t?: string }>;
}

export default async function MeetingDetailPage({
  params,
  searchParams,
}: MeetingPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const initialTime = resolvedSearchParams?.t ? parseInt(resolvedSearchParams.t, 10) : 0;

  const meeting = getMeetingById(id);

  if (!meeting) {
    return (
      <div className="mx-auto max-w-2xl py-16 text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-gray-500 ring-1 ring-gray-800">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Meeting Not Found
          </h1>
          <p className="text-sm text-gray-400">
            No meeting could be found with identifier &ldquo;<span className="font-mono text-gray-300">{id}</span>&rdquo;.
          </p>
        </div>
        <div>
          <Link
            href="/meetings"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition shadow"
          >
            ← Return to All Meetings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <MeetingDetailClient
      meeting={meeting}
      initialTime={isNaN(initialTime) ? 0 : initialTime}
    />
  );
}
