# Fathom Rebuild — Phase-by-Phase Step Plan

*Companion to fathom-implementation-plan.md. Each phase lists concrete, ordered steps. Commit at the end of every phase.*

---

## Phase 0 — Scaffold (Target: 20 min)

1. Run `npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"`
2. Delete boilerplate content from `app/page.tsx`, keep the file.
3. Create empty folders: `components/{layout,dashboard,calendar,meeting,transcript,search,share}`, `lib/{data,utils}`, `public/media`.
4. Add `lib/types.ts` with the `Meeting`, `TranscriptLine`, `ActionItem`, `ShareClip` types.
5. Confirm dev server runs (`npm run dev`).
6. `git add -A && git commit -m "chore: scaffold Next.js app, folder structure, base types"`
7. Push.

**Exit check:** blank app loads locally, folder structure exists, commit is on GitHub.

---

## Phase 1 — Fathom Product Pass (Target: 30 min, run alongside Phase 0/2 breaks)

1. Sign up for Fathom free plan.
2. Connect a calendar.
3. Start a 2-minute Zoom/Meet/Teams call with yourself, let the notetaker join and record.
4. After it processes: watch playback synced to transcript.
5. Open the AI summary, switch between any available templates.
6. Open action items, mark one complete.
7. Mid-playback, highlight/mark a moment and note where it lands (timestamp link? clip? comment?).
8. Use search across meetings (even with just this one meeting, confirm what search returns).
9. Create a share link/clip and open it in an incognito window to confirm it renders without login.
10. Look specifically at how Fathom would behave on an 8-person, 1-hour call — check speaker-count handling, long transcript scrolling, summary density — note this even if you can't test it directly (infer from UI copy, docs, or your own single-person test's structure).
11. Take screenshots at each step; save to a `recon/` folder locally (does not need to be committed, but keep for the walkthrough).
12. Write 5–10 bullet points: what's essential, what's ownable in scope, what you're deliberately leaving out and why.

**Exit check:** you can describe every core flow from memory, and have a short "what we're cutting and why" list ready for the walkthrough.

---

## Phase 2 — Data Model & Seed Data (Target: 30 min)

1. Finalize `lib/types.ts` (see implementation plan section 4).
2. Write `lib/data/meetings.ts` with 4 seeded `Meeting` objects:
   - Product Strategy — Q4 Roadmap
   - Weekly Engineering Sync
   - Customer Discovery Call
   - Marketing Launch Planning
3. For each meeting: 8–15 transcript lines with realistic speaker names/timestamps, 3-point summary + 2–3 decisions, 2–4 action items with owners.
4. Write `lib/utils/formatTime.ts` (seconds → `mm:ss`).
5. Write `lib/utils/search.ts` — simple case-insensitive substring match across meeting titles + transcript text, returning matches with surrounding snippet.
6. Sanity check: import the data into a scratch page and `console.log` it renders without type errors.
7. Commit: `feat(data): add typed seed data for 4 meetings, formatting + search utils`.

**Exit check:** `npm run build` type-checks cleanly against the seed data.

---

## Phase 3 — Layout Shell (Target: 20 min)

1. Build `components/layout/Sidebar.tsx` — nav links: Dashboard, Calendar, Search.
2. Build `components/layout/TopBar.tsx` — page title + quick search input.
3. Wire both into `app/layout.tsx`.
4. Create placeholder route files: `app/calendar/page.tsx`, `app/meetings/[id]/page.tsx`, `app/search/page.tsx`, `app/share/[token]/page.tsx` — each just rendering a heading for now.
5. Confirm all routes are reachable via the sidebar and render without errors.
6. Commit: `feat(layout): add nav shell and route skeleton`.

**Exit check:** clicking every nav item loads a distinct (even if empty) page.

---

## Phase 4 — Meeting Detail Page (CRITICAL, Target: 2 hours)

1. Build `components/meeting/Player.tsx`:
   - `<video>` or `<audio>` tag pointing at `public/media/sample-meeting.mp4`
   - Custom or native controls, duration display
   - Expose `currentTime` via a shared state/context so transcript can sync to it later
2. Build the meeting header: title, date, participants (avatars or initials), duration.
3. Build tab/section switcher: Overview | Transcript | Action Items.
4. Build `components/meeting/SummaryPanel.tsx`: overview text, key points list, decisions list.
5. Build `components/meeting/ActionItemList.tsx`: checkbox per item, owner label, toggle-complete using local component state (or lift to page state).
6. Wire `app/meetings/[id]/page.tsx` to look up the meeting by `id` from seed data, render 404-style fallback if not found.
7. Test with all 4 seeded meeting IDs.
8. Commit: `feat(meeting-detail): player, summary, action items, tab navigation`.

**Exit check:** navigating to any of the 4 meeting URLs shows a fully populated, working page — this is the single highest-priority deliverable, don't move on until it's solid.

---

## Phase 5 — Transcript Sync (Target: 1 hour)

1. Build `components/transcript/TranscriptView.tsx`: render `TranscriptLine[]` as speaker blocks with timestamp badges.
2. Clicking a timestamp seeks the player to that time (via the shared player state from Phase 4).
3. As the player plays, auto-highlight the currently active transcript line (compare `currentTime` to line timestamps).
4. Add a lightweight search/filter input within the transcript tab (optional per original plan — only if time allows).
5. Commit: `feat(transcript): synced speaker transcript with click-to-seek`.

**Exit check:** clicking a transcript line moves the player; playing the video highlights the matching line.

---

## Phase 6 — Dashboard + Calendar (Target: 1 hour)

1. Build `components/dashboard/MeetingCard.tsx`: title, date, participant count, link to detail page.
2. Build `app/page.tsx`: "Upcoming meetings" + "Recent meetings" sections using seed data (split by date logic).
3. Build `components/calendar/CalendarGrid.tsx`: simple day/time grid or list-by-day view (no drag-and-drop).
4. Wire calendar entries to link to `meetings/[id]`.
5. Commit: `feat(dashboard,calendar): meeting lists and calendar view wired to seed data`.

**Exit check:** dashboard is the first thing you see and it's immediately understandable within seconds — no empty states.

---

## Phase 7 — Search (Target: 1h15m)

1. Build `app/api/search/route.ts` (or keep fully client-side using `lib/utils/search.ts` — simpler, skip the API route if time is tight).
2. Build `components/search/SearchResults.tsx`: show matching meeting title + highlighted snippet of matching transcript text.
3. Wire the TopBar quick search and the dedicated `/search` page to the same search function.
4. Clicking a result opens the meeting and (stretch) scrolls/seeks to the matching transcript line.
5. Commit: `feat(search): meeting + transcript search with snippet results`.

**Exit check:** searching a word that only appears in one meeting's transcript returns that meeting with a relevant snippet.

---

## Phase 8 — Sharing/Clip Flow (Target: 1h15m)

1. Build `components/share/ShareModal.tsx`: start/end time selectors (can default to current player position + a fixed window, or simple numeric inputs).
2. On "Create share link," generate a `ShareClip` (mock token, e.g. `crypto.randomUUID()` or short hash) and store it in memory (module-level array or same seed-data pattern).
3. Build `app/share/[token]/page.tsx`: public page, no sidebar/auth, shows the meeting title, the clipped transcript range, and a player scoped/seeked to that range.
4. Test by opening the generated share URL in an incognito window.
5. Commit: `feat(share): clip selection, token generation, public share page`.

**Exit check:** share link opens correctly with no login required, in a fresh incognito session.

---

## Phase 9 — Templates (Target: 1 hour)

1. Define 2–3 simple templates (e.g., "Standard Summary," "Action-Items Focused," "Decisions Focused") as data structures describing which summary sections to emphasize/reorder.
2. Add a template switcher UI in the meeting detail Overview tab.
3. Re-render `SummaryPanel` based on selected template (reordering/relabeling existing seed data — no new content needed).
4. Commit: `feat(templates): summary template switching`.

**Exit check:** switching templates visibly changes the summary's structure/emphasis without breaking anything.

---

## Phase 10 — Integration Pass (Target: 1 hour)

1. Click through every link on every page — dashboard → meeting, calendar → meeting, search → meeting, meeting → share, sidebar nav — fix anything broken.
2. Confirm all 4 seeded meetings work end-to-end through every feature (transcript, summary, action items, share, templates).
3. Add a 5th "edge case" meeting stub representing the 8-person/1-hour call scenario if time allows, even minimally seeded — demonstrates you thought about the case that "actually matters" per the brief.
4. Commit: `fix: integration pass across all flows`.

**Exit check:** a first-time user could go dashboard → meeting → transcript → summary → action items → share → search, with zero dead links.

---

## Phase 11 — Polish (Target: 45 min)

1. Add loading states (skeletons or simple spinners) where data "loads."
2. Add an empty state for search-with-no-results.
3. Check mobile breakpoints (sidebar collapses, transcript/player stack vertically).
4. Pass over spacing/typography consistency — one type scale, consistent padding.
5. Set page `<title>` per route, add a favicon.
6. Commit: `polish: loading/empty states, responsive fixes, typography pass`.

---

## Phase 12 — Deploy & Verify (Target: 30 min)

1. Push final commits.
2. Connect repo to Vercel, deploy.
3. Open deployed URL in an incognito/private window — confirm every flow works with zero sign-in.
4. Test on an actual phone or narrow browser window for mobile behavior.
5. Fix any prod-only issues (env vars, asset paths, case-sensitive imports on Linux vs Windows).
6. Commit + push any fixes, redeploy.

**Exit check:** live URL works for a signed-out stranger, on both desktop and mobile.

---

## Phase 13 — Walkthrough (Target: 30 min)

1. Script the 5-minute structure (see original plan section 12): intro (0:30) → dashboard/calendar (45s) → meeting detail: recording/transcript/summary/action items (1:30) → templates/search (45s) → share flow incl. public view (45s) → what you prioritized/cut and why (45s).
2. Record with camera on, in one take if possible.
3. Upload, get a public link, confirm it opens in a fresh browser/incognito.
4. Submit: live URL, GitHub repo, walkthrough link — each labeled in the submission form.

---

## Running Discipline Reminders

- Commit at the end of every phase, `git add -A` first so `.agent-logs/` stays interleaved.
- If a phase is running long, cut scope within it rather than skipping ahead — protect the order: **Meeting detail → transcript/summary/action items → dashboard/calendar → search → sharing → templates → polish.**
- Re-check total elapsed time against the 12-hour window after every phase, not just at scheduled checkpoints.
