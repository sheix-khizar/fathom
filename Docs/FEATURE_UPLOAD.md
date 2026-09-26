# Feature Spec — Real Meeting Upload (for coding agent)

**Goal:** add an "Add meeting" flow that accepts a real audio/video recording, sends it
to Gemini for transcription + summary extraction, and writes the result into Supabase
through the same path every other meeting uses. This replaces "seed script is the only
way data gets in" with a real, demonstrable feature, and gives a repeatable way to test
against real recordings instead of typed sample text.

Build this as its own phase, after Phase 3 (API routes) and before Phase 8 (polish) in
the existing phase plan.

---

## 1. Storage

Add a Supabase Storage bucket for the raw recordings.

- Bucket name: `recordings`
- Access: private (served only through a signed URL or the server, never public)
- Max file size: cap client-side at ~25MB (keeps Gemini inline-data calls fast; larger
  files should be rejected with a clear error, not silently truncated)

## 2. New API route

`POST /api/meetings/upload`

- Accepts `multipart/form-data`: the file, plus optional `title`.
- Steps:
  1. Validate file type (`audio/*` or `video/*`) and size; reject otherwise with a 400
     and a specific message.
  2. Upload the raw file to the `recordings` Supabase Storage bucket.
  3. Base64-encode the file (or stream it, if the SDK supports it) and send it to
     Gemini with the prompt below.
  4. Parse Gemini's JSON response.
  5. Insert one row into `meetings` (`status: 'past'`, `recording_url` pointing at the
     storage object), then bulk-insert the returned `transcript` into
     `transcript_lines` and `actionItems` into `action_items` — same insert logic the
     seed script already uses, not a separate code path.
  6. Return the new meeting's id so the client can redirect to `/meetings/[id]`.
- On any Gemini failure or malformed JSON: still save the meeting with the uploaded
  recording and an empty transcript/summary, and surface a clear "processing failed,
  here's the raw recording" state rather than losing the upload.

## 3. Gemini function

Extend (don't duplicate) the existing `lib/ai/summarize.ts` with a new export that
takes audio instead of transcript text:

```ts
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type ProcessedMeeting = {
  transcript: { speaker: string; startSec: number; text: string }[];
  summary: string;
  decisions: string[];
  actionItems: { title: string; owner: string }[];
};

export async function processRecording(
  fileBase64: string,
  mimeType: string
): Promise<ProcessedMeeting | null> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Transcribe this meeting recording with speaker labels and
approximate start times in seconds. Then extract a summary, decisions, and
action items. Return ONLY valid JSON, no markdown fences, matching:
{
  "transcript": [{"speaker": "...", "startSec": 0, "text": "..."}],
  "summary": "2-4 sentences",
  "decisions": ["..."],
  "actionItems": [{"title": "...", "owner": "best-guess name"}]
}`;

  const result = await model.generateContent([
    { inlineData: { data: fileBase64, mimeType } },
    { text: prompt },
  ]);

  const raw = result.response.text().trim().replace(/^```json\s*|```$/g, "");
  try {
    return JSON.parse(raw) as ProcessedMeeting;
  } catch {
    return null;
  }
}
```

## 4. UI

- One entry point: an "Add meeting" button on the dashboard and on the meetings index
  page, opening a small upload form (file input + optional title field).
- States to handle explicitly, not skip: idle → uploading → processing (Gemini call,
  this can take 10–30s, show a spinner with real copy — "Transcribing your
  recording..." not a generic loader) → done (redirect to the new meeting) → error
  (specific message, file still saved if the upload itself succeeded).
- No need for a separate "review before saving" step for v1 — land straight on the
  meeting detail page once processing finishes, same as opening any other meeting.

## 5. What this does NOT need

- No background job queue — a single synchronous request/response is fine at this
  scale and for the walkthrough demo. Note in the walkthrough that a production
  version would move this off the request thread.
- No live/streaming transcription — upload-then-process is enough to prove the
  pipeline is real.
- No speaker-diarization tuning — Gemini's guess is good enough for a two-person demo
  call; call this out as a known limitation in the walkthrough rather than trying to
  fix it under time pressure.

## Exit condition

Record a real 2–5 minute call with yourself, upload it through this flow on the
deployed app, and get back a meeting detail page with a real transcript, summary,
decisions, and action items — sourced from actual speech, not seed data. This is also
your strongest walkthrough moment: do this on camera, live.