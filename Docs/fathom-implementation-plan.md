# Fathom Rebuild — Implementation Plan (Option B: Scaffold First)

*12-hour window. Clock started ~20:31 (session 1 capture setup). Capture verified and committed at commit `07d7af9`. Build starts now.*

---

## 0. Strategy for Option B

Scaffold the project immediately and explore Fathom's live product in parallel/interleaved — not as a separate 45-minute block up front. Screenshots and product notes get captured as short breaks between build phases 1 and 2, not before either.

**Non-negotiable protection order** (from the plan doc, section 14) if time runs out:
`Meeting detail → transcript/summary/action items → dashboard/calendar → search → sharing → templates → polish`

---

## 1. Stack Decisions (lock these now, do not revisit)

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 14 (App Router) + TypeScript | Fastest path to routing + API routes in one project |
| Styling | Tailwind CSS | Speed, no context-switch to CSS files |
| Data | In-memory / JSON seed data via `lib/data/*.ts`, no DB | 12-hour window — a real DB (Supabase/Postgres) adds setup + auth risk for no scoring benefit. Static typed seed data is "realistic" and instant. |
| Auth | None | Not required by brief. Shared link must work logged-out anyway. |
| Media | One royalty-free sample MP4/audio in `public/media/` | Brief explicitly allows stubbing capture |
| Deploy | Vercel | Zero-config Next.js deploys, public URL in under 2 minutes |
| State | React state + URL params | No Redux/Zustand — unnecessary overhead |

**Decision made, not revisited later:** no database. If this turns out to be wrong mid-build, that's a documented cut, not a silent scope change — say so in the walkthrough.

---

## 2. Hour-by-Hour Schedule (12-hour window)

| Time (elapsed) | Block | Deliverable |
|---|---|---|
| 0:00–0:20 | Scaffold + push | `create-next-app`, Tailwind config, folder structure, first real commit pushed |
| 0:20–0:50 | Fathom product pass (parallel notes) | Screenshots + short written notes on: calendar connect, live call, playback+transcript sync, summary/templates, action items, highlight-mid-call, search, share-with-non-participant, 8-person/1hr call edge case |
| 0:50–1:20 | Data model + seed data | `lib/data/meetings.ts`, `types.ts` — 4 seeded meetings w/ transcripts, summaries, decisions, action items |
| 1:20–1:40 | Layout shell | Left nav, top bar, responsive shell, routing skeleton for all pages |
| 1:40–3:40 | **Meeting Detail page (CRITICAL)** | Header, player (stubbed), tabbed Overview/Transcript/Action Items, AI summary block, action item checklist |
| 3:40–4:40 | Transcript sync | Timestamped speaker blocks, click-to-seek against player, highlight-on-click |
| 4:40–5:40 | Dashboard + Calendar | Upcoming/recent lists, calendar day/time view, click-through to meeting |
| 5:40–7:00 | Search | Meeting titles + transcript text search, snippet results, click to open + jump to match |
| 7:00–8:15 | Sharing/clip flow | Select range, generate token/route, public `/share/[id]` page (no auth) |
| 8:15–9:15 | Templates | 2–3 summary presentation templates, switch UI |
| 9:15–10:15 | Seed data pass 2 + connect everything | Fix broken links between pages, make sure all seeded meetings work end-to-end |
| 10:15–11:00 | Polish | Empty/loading/error states, spacing, mobile breakpoints, favicon/title |
| 11:00–11:30 | Deploy + logged-out verification | Push to Vercel, open in incognito, confirm no auth wall anywhere |
| 11:30–12:00 | Buffer / walkthrough recording | Record 5-min Loom, camera on |

This compresses your original 24-hour schedule by roughly half by cutting the up-front exploration block from 45 min to interleaved note-taking, and dropping DB/deployment-research overhead.

---

## 3. Project Structure (create in scaffold step)

```
app/
  page.tsx                    # Dashboard
  layout.tsx                  # Root layout (nav shell)
  calendar/page.tsx
  meetings/[id]/page.tsx      # Meeting detail (tabs: overview/transcript/action-items)
  search/page.tsx
  share/[token]/page.tsx      # Public, no auth
  api/
    search/route.ts

components/
  layout/Sidebar.tsx
  layout/TopBar.tsx
  dashboard/MeetingCard.tsx
  calendar/CalendarGrid.tsx
  meeting/Player.tsx
  meeting/SummaryPanel.tsx
  meeting/ActionItemList.tsx
  transcript/TranscriptView.tsx
  search/SearchResults.tsx
  share/ShareModal.tsx

lib/
  data/meetings.ts             # seed data
  types.ts
  utils/formatTime.ts
  utils/search.ts              # simple client-side text match

public/
  media/sample-meeting.mp4

.agent-logs/                   # already exists, keep committing
```

---

## 4. Data Model (finalize before writing UI)

```ts
type Meeting = {
  id: string;
  title: string;
  date: string;
  durationSec: number;
  participants: string[];
  recordingUrl: string;
  summary: { overview: string; keyPoints: string[]; decisions: string[] };
  transcript: TranscriptLine[];
  actionItems: ActionItem[];
};

type TranscriptLine = { id: string; speaker: string; timestampSec: number; text: string };
type ActionItem = { id: string; title: string; owner: string; completed: boolean };
type ShareClip = { id: string; meetingId: string; startSec: number; endSec: number; token: string };
```

Seed 4 meetings (per original plan): Product Strategy Q4 Roadmap, Weekly Engineering Sync, Customer Discovery Call, Marketing Launch Planning — each with 8–15 transcript lines, 3-point summary, 2–3 decisions, 2–4 action items.

---

## 5. Commit Discipline

- Commit at the end of every block above, not in one dump. Keep messages descriptive (`feat(meeting-detail): add transcript panel with speaker sync`).
- Run `git add -A` before each commit so `.agent-logs/` (which updates continuously via the watcher daemon) stays interleaved with real code, not squashed at the end.
- Push after each commit if possible — protects against local machine issues eating hours of work.

---

## 6. Cut List (documented up front, restate in walkthrough)

- No real Zoom/Meet/Teams bot integration — stubbed recording confirmed allowed by brief.
- No database/persistence — static seed data, resets on redeploy. Acceptable since the brief only asks for a realistic, non-empty demo state.
- No auth/login system.
- No drag-and-drop calendar editing — read-only calendar view.
- No AI-model calls — summary/transcript content is pre-written to look AI-generated, since real transcription/LLM pipelines are explicitly out of scope per section 4 of the original plan.

---

## 7. Immediate Next Action

Run the scaffold command now:
```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*"
```
Then commit immediately, before writing any component code, so the build has a real starting point in git history.
