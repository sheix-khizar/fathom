# Fathom Rebuild — Plan v2

## What 8x's response is actually asking for

1. **Your own interface, not a copy.** Fathom is a reference point, not a spec to match
   pixel-for-pixel. What's being judged is the reasoning behind the product — what I
   kept, what I cut, what I'd change to make it better to use — not fidelity to the
   original screens.
2. **A real, connected backend.** "A working database and API, not mock data or
   hardcoded responses." Every screen has to be reading from and writing to something
   real.
3. **A separate one-minute intro video** — something about me that isn't on my CV,
   uploaded with link sharing on, added to the submission alongside the 5-minute
   walkthrough. Doesn't affect the build itself.
4. **A tighter clock.** 12 hours instead of 24, "generous, not enforced." Everything
   from the original brief still applies underneath this — stub the recording/capture
   layer if I want to, seed it with real-looking data, live link has to open for
   someone signed out, `.agent-logs/` stays committed as I go.

## Tech stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js + TypeScript | One deploy target, App Router covers both pages and API routes. |
| Database | Supabase (managed Postgres) | Real, hosted, connected from the first commit — nothing to migrate later. Auth and storage are there if either turns out useful. |
| AI | Gemini API | Generates the summary, key points, and decisions from the actual transcript text, server-side, at ingest time. This is also where product judgment is most visible: I decide what the model is asked to pull out (decisions vs. general notes vs. action items with an owner guess), not just what it hands back by default. |
| Styling | Tailwind CSS | Fast, and doesn't fight the "own visual design" requirement — no component kit whose defaults show through in the final look. |
| Hosting | Vercel | Straight `vercel deploy`, works cleanly with Next.js and Supabase's connection pooling. |

## Where Gemini sits in the flow

1. A meeting's transcript (real or stubbed capture) is written to Supabase.
2. A server route sends the transcript to Gemini with a structured prompt: return a
   short summary, a list of decisions, and a list of candidate action items with an
   owner guess.
3. The parsed response is written back into Supabase as real rows — the AI output
   becomes queryable data, not a string that only exists in a component.
4. If Gemini is unavailable, or a transcript is empty (an upcoming meeting), the UI
   shows an honest empty state instead of fabricating content.

## Screens (own design, own opinions, same core journey)

1. **Dashboard** — upcoming + recent meetings, quick search, empty-state handling.
2. **Meeting detail** — header, stub player, tabs for Overview (Gemini's summary and
   decisions), Transcript (speaker + timestamp), and Action items (owner, toggle
   complete). Gemini's owner guess on an action item is editable, not fixed — a small,
   real product opinion, not decoration.
3. **Search** — query across meeting titles and transcript text, snippet plus
   jump-to-meeting.
4. **Share** — a token-based public route, viewable signed out, showing a bounded
   transcript window rather than a video clip (the recording layer is stubbed, so the
   share flow is honest about sharing the transcript moment, not the footage).

## What I'm deliberately changing or cutting from Fathom (say this in the walkthrough)

- **Cutting** a full calendar grid — folded into the dashboard's upcoming/recent lists.
  One solid list beats a half-built calendar in 12 hours.
- **Cutting** multiple swappable summary templates — one summary format, actually
  driven by a real model call, rather than several thin ones.
- **Changing** action items to show Gemini's owner guess as editable rather than fixed —
  treating the model's first guess as a draft, not a fact.
- **Changing** sharing to a transcript window instead of a clip, and saying so plainly
  rather than pretending the capture layer is real.

## Priority order for the 12-hour window

1. Supabase schema + seed data — protects "real backend" and "seed data" first, since
   both are now hard requirements.
2. Gemini integration: transcript in, summary/decisions/action-items out, written to
   Supabase.
3. API routes for meetings, search, action-item updates, and share-link creation.
4. Meeting detail page (the CRITICAL path) — own visual design.
5. Dashboard.
6. Search.
7. Share (public, signed-out route).
8. Polish and responsive pass, deploy to Vercel, record the 5-minute walkthrough and
   the separate 1-minute intro video.

## Design direction

An editorial reading surface for transcripts rather than a generic SaaS dashboard —
timestamps treated as real data (monospaced), not decoration; a quiet, deliberate
palette rather than a default component-kit look. Full token system lives in the
codebase's `app/globals.css` once the build starts.