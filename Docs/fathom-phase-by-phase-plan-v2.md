# Fathom Rebuild — Phase-by-Phase Execution Plan

Built for Antigravity, against Plan v2 (Next.js + TypeScript + Supabase + Gemini API +
Tailwind + Vercel), inside your existing `sheix-khizar/fathom` repo. 12-hour window,
tracked not enforced — the phase times below add up to about 10.5 hours so there's
slack for the inevitable Gemini-prompt or RLS-policy detour.

**Work in the same repo and the same Antigravity session throughout.** Your capture
hooks in `.agents/` already work in this repo — starting fresh anywhere else breaks the
log continuity 8x is explicitly looking at.

---

## Phase 0 — Pre-flight (0:00–0:20)

Nothing below starts until this phase is green.

- [ ] Open the existing `fathom` repo in Antigravity, confirm `.agents/hooks.json` and
      the watcher are still running (send a throwaway prompt, check it lands in
      `.agent-logs/`).
- [ ] Create a new Supabase project. Save the project URL, anon key, and service-role
      key somewhere you can paste into `.env.local`.
- [ ] Get a Gemini API key from Google AI Studio.
- [ ] Confirm you have Vercel CLI access or the GitHub repo already linked to a Vercel
      project from the first submission.
- [ ] Delete or move aside anything under `lib/data/` — this is the mock data v1 was
      built on, and it should not silently keep powering pages once the Supabase
      queries are in.

**Exit condition:** capture confirmed working, Supabase project exists, Gemini key in
hand.

---

## Phase 1 — Foundation: schema, environment, design tokens (0:20–1:30)

- [ ] `npm install @supabase/supabase-js`, add `.env.local` with
      `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
      `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`.
- [ ] Write the schema directly in the Supabase SQL editor (or as a migration file
      under `supabase/migrations/`), covering: `meetings`, `transcript_lines`,
      `action_items`, `share_clips`. Mirror the fields from Plan v2's data model —
      `meetings.status` (`upcoming`/`past`), `meetings.summary`,
      `meetings.decisions` (or a separate table if you want them queryable
      individually), `action_items.owner` + `completed`, `share_clips.token` unique.
- [ ] Enable Row Level Security; add a public-read policy for the tables the share page
      needs, and keep writes to the service-role key on the server only.
- [ ] Set up `lib/supabase/server.ts` (service-role client, server-only) and
      `lib/supabase/client.ts` (anon client, for anything client-side) so the two
      never get mixed up.
- [ ] Lock in the design tokens from Plan v2 in `tailwind.config.ts` / `globals.css`:
      palette, type scale, the editorial/transcript-as-document direction. Do this now
      so every screen you build after this inherits it instead of getting reskinned
      later.

**Exit condition:** `select * from meetings` in the Supabase dashboard returns an
empty table with the right columns, and the app can read/write to it locally.

---

## Phase 2 — Seed data + Gemini pipeline (1:30–3:00)

- [ ] Write a seed script (`scripts/seed.ts`, run with `tsx` against the service-role
      client) with the same realistic meetings from Plan v2 (product strategy,
      engineering sync, customer discovery call, launch planning, one upcoming
      meeting) — full transcripts, not just titles.
- [ ] Build the Gemini call as a standalone server function first
      (`lib/ai/summarize.ts`) — transcript text in, structured JSON out (summary,
      decisions[], action_items[] with an owner guess). Test it against one seeded
      transcript from a script before wiring it into any route.
- [ ] Decide and document the failure behavior: empty/short transcript → skip the
      call and leave summary fields empty rather than sending a near-empty prompt.
- [ ] Have the seed script call this function for each past meeting and write the
      result into Supabase, so what ships is genuinely model-generated, not
      hand-written summaries pretending to be.

**Exit condition:** running the seed script populates Supabase with meetings whose
summaries and decisions came out of an actual Gemini call, visible in the Supabase
table editor.

---

## Phase 3 — API routes (3:00–4:00)

- [ ] `GET /api/meetings` — list, with computed open-action-item counts.
- [ ] `GET /api/meetings/[id]` — full detail: transcript, summary, decisions, action
      items.
- [ ] `PATCH /api/meetings/[id]/action-items/[itemId]` — toggle completion (and, if you
      keep the "editable owner guess" idea from Plan v2, allow updating `owner` here
      too).
- [ ] `GET /api/search?q=` — across meeting titles and transcript text.
- [ ] `POST /api/share` — create a `share_clips` row with a random token, given a
      meeting id and a start/end range.
- [ ] `GET /api/share/[token]` — public read, no auth, scoped to the RLS public-read
      policy from Phase 1.

**Exit condition:** every route returns real data from Supabase when hit directly
(curl or the browser), before any UI exists to call them.

---

## Phase 4 — Meeting detail page (CRITICAL path) (4:00–6:30)

This is the one screen that has to be right even if everything after it gets cut.

- [ ] Header: title, date, participants, duration.
- [ ] Stub player: an honest, clearly-labeled stand-in timeline (not a real audio
      scrubber) that the transcript can sync against — say so in the UI, not just the
      walkthrough.
- [ ] Tabs: Overview (Gemini summary + decisions), Transcript (speaker + timestamp,
      synced to the stub timeline), Action items (checkbox toggle wired to the PATCH
      route, owner shown as editable).
- [ ] Share-from-transcript: pick a start line, pick an end line, call `POST
      /api/share`, surface the resulting link.
- [ ] Empty states for an upcoming meeting (no transcript, no summary yet) — written
      in the interface's voice, not a blank tab.

**Exit condition:** you can open a seeded meeting, read a real Gemini summary, click
through the transcript, tick off an action item and see it persist on refresh, and
generate a working share link.

---

## Phase 5 — Dashboard (6:30–7:30)

- [ ] Upcoming section, recent section, both reading from `GET /api/meetings` or a
      direct server-side Supabase query.
- [ ] Quick search entry point.
- [ ] Empty state for a brand-new account with zero meetings (shouldn't be visible in
      your seeded demo, but worth having so the app doesn't look broken if seeding
      fails on deploy).

**Exit condition:** dashboard reflects the live Supabase data, not anything cached
from v1's `lib/data/`.

---

## Phase 6 — Search (7:30–8:15)

- [ ] Search page hitting `/api/search`, showing meeting-title matches and
      transcript-snippet matches separately, each linking into the meeting detail
      page at roughly the right spot.

**Exit condition:** searching a phrase you know exists in a seeded transcript returns
it with a usable snippet.

---

## Phase 7 — Public share page (8:15–8:45)

- [ ] `/share/[token]` page, server-rendered, no auth check, reading only the
      transcript window for that clip via the public-read policy.
- [ ] Test it in an incognito window specifically — this is one of the two "opens
      signed out" checks 8x will actually do.

**Exit condition:** a share link generated in Phase 4 opens correctly in a fully
signed-out browser.

---

## Phase 8 — Polish and responsive pass (8:45–10:00)

- [ ] Mobile breakpoint pass on all four screens — not pixel-perfect, just usable.
- [ ] Loading and error states on any page waiting on a Supabase or Gemini call.
- [ ] A final read against the "what I changed/cut" list from Plan v2 — make sure the
      UI itself doesn't imply a calendar page or template switcher exists if you cut
      them; don't leave dead nav links.
- [ ] Quick visual self-critique pass per the design-review habit: does anything look
      like a default Tailwind/shadcn card grid that snuck back in under time pressure?

**Exit condition:** the app doesn't feel like four unrelated screens — one consistent
visual identity end to end.

---

## Phase 9 — Deploy and verify (10:00–10:45)

- [ ] Set the same env vars (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
      `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`) in the Vercel project.
- [ ] Deploy, then run the seed script once against the production Supabase project so
      the live app isn't empty.
- [ ] Open the live URL in an incognito window and walk the full core journey:
      dashboard → meeting → transcript → summary → action items → search → share link
      → share link opened in a second incognito window.

**Exit condition:** every box in the submission checklist below that can be checked
before recording, is checked.

---

## Phase 10 — Walkthrough, intro video, submission (10:45–12:00)

- [ ] Record the 5-minute walkthrough (camera on), following the beats from Plan v1's
      video plan: intro → dashboard/calendar-equivalent → meeting detail → templates/
      search-equivalent → share flow including the public view → what you prioritized,
      cut, and changed, and why (this is where the "make it your own" answer lives).
- [ ] Record the separate 1-minute intro video — something about yourself not on your
      CV — Loom or Drive with link sharing on.
- [ ] Commit any remaining `.agent-logs/` entries; don't squash or clean them up.
- [ ] Submit: live link, public repo link, walkthrough link, intro video link, all
      labeled, into the resubmission form.

---

## Submission checklist (final pass)

- [ ] Live link opens for someone not signed in.
- [ ] Repo is public, `.agent-logs/` committed and current.
- [ ] No mock/hardcoded data anywhere — every screen traces back to Supabase.
- [ ] Gemini-generated summary/decisions/action-items visible on at least the seeded
      past meetings.
- [ ] Dashboard → meeting → transcript → summary → action items works.
- [ ] Search works.
- [ ] Share/clip flow works, verified signed out.
- [ ] Own visual design — nothing that reads as a copy of fathom.video's screens.
- [ ] Walkthrough recorded, camera on, under 5 minutes.
- [ ] Separate 1-minute intro video recorded and linked.
- [ ] All links labeled and entered into the resubmission form before end of day
      Saturday, September 26.