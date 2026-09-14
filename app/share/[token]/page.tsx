import Link from "next/link";
import { getClipByToken } from "@/lib/data/meetings";
import PublicClipClient from "@/components/share/PublicClipClient";

interface SharePageProps {
  params: Promise<{ token: string }>;
}

export default async function ShareClipPage({ params }: SharePageProps) {
  const { token } = await params;
  const data = getClipByToken(token);

  if (!data) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-900 text-gray-500 ring-1 ring-gray-800">
          <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Shared Clip Not Found
          </h1>
          <p className="text-sm text-gray-400">
            The shared meeting link with token &ldquo;
            <span className="font-mono text-gray-300">{token}</span>
            &rdquo; could not be found or has expired.
          </p>
        </div>
        <div>
          <Link
            href="/meetings"
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition shadow"
          >
            ← Explore Fathom Meetings
          </Link>
        </div>
      </div>
    );
  }

  return <PublicClipClient clip={data.clip} meeting={data.meeting} />;
}
