import Link from "next/link";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  // Query Supabase for real stats to show in the live demo teaser
  const { data: meetings } = await supabaseAdmin
    .from("meetings")
    .select("id, title, duration, date, summary, status")
    .order("date", { ascending: false });

  const { data: actionItems } = await supabaseAdmin
    .from("action_items")
    .select("id")
    .eq("completed", false);

  const totalMeetings = meetings?.length || 0;
  const openTasksCount = actionItems?.length || 0;
  const sampleMeeting = meetings?.[0];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] selection:bg-teal-500/20 selection:text-teal-900">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 font-bold text-white shadow-sm">
              F
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold tracking-tight text-slate-900">Fathom</span>
              <span className="rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-mono font-semibold uppercase text-amber-800">
                v2 · beta
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-3 sm:gap-6 text-xs font-medium">
            <a href="#features" className="text-slate-600 hover:text-slate-900 transition hidden sm:inline">
              Features
            </a>
            <a href="#architecture" className="text-slate-600 hover:text-slate-900 transition hidden sm:inline">
              Architecture
            </a>
            <a
              href="#"
              className="text-slate-500 hover:text-slate-900 transition"
              title="Sign in placeholder"
            >
              Sign in
            </a>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-teal-800 transition"
            >
              Open Workspace →
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 sm:pt-20 sm:pb-28">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 text-center space-y-6">
          {/* Hero pill badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3.5 py-1 text-xs font-mono font-medium text-teal-800 shadow-sm animate-fadeIn">
            <span className="h-1.5 w-1.5 rounded-full bg-teal-600 animate-pulse" />
            Live Supabase Backend • Gemini 3.8 Flash Synthesized
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.1] animate-fadeInUp">
            AI Meeting Intelligence &<br className="hidden sm:inline" /> Synchronized Notetaker
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-600 leading-relaxed animate-fadeInUp">
            Record, transcribe, summarize, and extract actionable deliverables with zero friction.
            A quiet editorial reading surface backed by Google Gemini and live Postgres storage.
          </p>

          {/* Primary CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 animate-fadeInUp">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-6 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-teal-800 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <span>Try the Demo / Open Workspace</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>

            <Link
              href="/meetings"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3.5 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition"
            >
              Browse All Meetings ({totalMeetings})
            </Link>
          </div>

          {/* Live Workspace Teaser Preview Card */}
          <div className="mx-auto max-w-4xl pt-10 animate-fadeInUp">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xl text-left space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-3 w-3 rounded-full bg-emerald-500" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-500">
                    Live Demo Workspace Preview
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-700 font-medium">
                    {totalMeetings} Live Sessions
                  </span>
                  <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 font-medium">
                    {openTasksCount} Open Deliverables
                  </span>
                </div>
              </div>

              {sampleMeeting && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div className="md:col-span-2 space-y-3">
                    <span className="rounded-full bg-teal-50 border border-teal-200 px-2.5 py-0.5 text-[10px] font-mono font-medium text-teal-800">
                      AI EXECUTIVE BRIEFING
                    </span>
                    <h3 className="text-lg font-bold text-slate-900">
                      {sampleMeeting.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 italic border-l-2 border-teal-600/40 pl-3">
                      "{sampleMeeting.summary || "Team alignment on launch milestones and architecture roadmap."}"
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 block mb-1">
                        Session Scope
                      </span>
                      <span className="text-sm font-semibold text-slate-800 font-mono">
                        ⏱ {sampleMeeting.duration}
                      </span>
                    </div>
                    <Link
                      href={`/meetings/${sampleMeeting.id}`}
                      className="inline-flex items-center justify-center rounded-xl bg-teal-700 px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-800 transition shadow-sm"
                    >
                      Inspect Synchronous Session →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="border-t border-slate-200 bg-slate-50/50 py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 space-y-12">
          <div className="text-center space-y-3">
            <span className="rounded-full bg-teal-50 border border-teal-200 px-3 py-1 text-xs font-mono font-medium text-teal-800">
              Core Capabilities
            </span>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Engineered for Editorial Clarity
            </h2>
            <p className="mx-auto max-w-xl text-sm text-slate-600">
              Every screen is built around honest representation of speech, structured intelligence, and zero-leak privacy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Feature 1 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md hover:border-slate-300 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Synchronous Diarization</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Dialogue lines are stored in Supabase with exact timestamps, speaker labels, and interactive seeking. Click any line to seek the playback scrubber directly to that dialogue moment.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md hover:border-slate-300 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Gemini Executive Summaries</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Google Gemini synthesizes dialogue at ingest time into an executive overview and an explicit list of team decisions, stored as queryable structured data rather than client strings.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md hover:border-slate-300 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Draft Action Items & Reassignment</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                AI owner guesses are treated as editable drafts rather than static assertions. Click any owner chip to reassign ownership or toggle deliverables with tactile checkboxes.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm transition hover:shadow-md hover:border-slate-300 space-y-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-slate-900">Zero-Leak Public Moment Sharing</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Share bounded dialogue windows via public tokens without requiring login. Supabase Row Level Security strictly withholds all dialogue outside the slice and all internal action items.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Honest Architecture Disclaimer Section */}
      <section id="architecture" className="border-t border-slate-200 bg-white py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-3xl border border-amber-200 bg-amber-50/60 p-6 sm:p-8 space-y-3 shadow-sm">
            <div className="flex items-center gap-2 text-amber-800">
              <span className="flex h-5 w-5 items-center justify-center rounded-md bg-amber-200/80 font-bold text-xs">
                ℹ
              </span>
              <h4 className="text-sm font-bold uppercase tracking-wider font-mono">
                Capture Architecture Disclosure
              </h4>
            </div>
            <p className="text-xs sm:text-sm text-amber-900 leading-relaxed">
              <strong>Honest build note:</strong> Automatic bot auto-join for live Zoom, Google Meet, and Teams calls is stubbed in this MVP release. Meeting intelligence is powered by manual recording upload (supporting up to 25MB audio/video files) ingested directly into Supabase Storage and synthesized by Gemini 3.8.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-6xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800">Fathom v2</span>
            <span>•</span>
            <span>Editorial Meeting Intelligence</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-teal-700 hover:underline font-semibold">
              Live Workspace
            </Link>
            <Link href="/meetings" className="text-slate-600 hover:text-slate-900">
              Meetings
            </Link>
            <Link href="/search" className="text-slate-600 hover:text-slate-900">
              Search
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
