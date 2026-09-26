import { GoogleGenAI } from '@google/genai';

// Guard against browser execution
if (typeof window !== 'undefined') {
  throw new Error('lib/ai/summarize.ts cannot be executed on the client browser.');
}

export interface ActionItemGuess {
  text: string;
  owner: string | null;
}

export interface MeetingIntelligence {
  summary: string | null;
  keyPoints: string[];
  decisions: string[];
  actionItems: ActionItemGuess[];
}

export interface TranscriptEntry {
  speaker: string;
  text: string;
  timestamp?: string;
}

const CANDIDATE_MODELS = [
  'gemini-3.8-flash',
  'gemini-3.5-flash',
  'gemini-3.7-flash',
  'gemini-flash-latest'
];

/**
 * Summarizes meeting transcripts using Google Gemini with structured intelligence output.
 * If transcript is empty or too short, returns an honest empty state rather than inventing insights.
 */
export async function generateMeetingIntelligence(
  transcript: TranscriptEntry[] | string,
  meetingTitle?: string
): Promise<MeetingIntelligence> {
  // 1. Format and evaluate transcript length
  let transcriptText = '';
  let wordCount = 0;

  if (Array.isArray(transcript)) {
    if (transcript.length === 0) {
      return getEmptyIntelligence();
    }
    transcriptText = transcript
      .map(line => `[${line.timestamp || '00:00'}] ${line.speaker}: ${line.text}`)
      .join('\n');
  } else if (typeof transcript === 'string') {
    transcriptText = transcript.trim();
  }

  wordCount = transcriptText.split(/\s+/).filter(Boolean).length;

  // Honest handling: If transcript is too short (< 25 words), do not hallucinate
  if (wordCount < 25) {
    return getEmptyIntelligence();
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not set in environment.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const systemInstruction = `You are an elite executive meeting intelligence assistant for Fathom.
Your job is to analyze real meeting transcripts and extract accurate, grounded insights.
Never invent participants or actions not discussed.
Always format your output as valid JSON matching this schema:
{
  "summary": "A concise, objective executive summary paragraph (2-4 sentences) summarizing the main purpose, discussion, and outcome.",
  "keyPoints": ["Bullet point of major discussion topic", ...],
  "decisions": ["Explicit decision agreed upon by the team", ...],
  "actionItems": [
    {
      "text": "Specific task or action committed to",
      "owner": "Name of the person who committed to it, or null if unassigned"
    }
  ]
}`;

  const prompt = `Meeting Title: ${meetingTitle || 'Meeting'}

Transcript:
${transcriptText}

Extract the executive summary, key points, decisions finalized, and candidate action items with owner guesses. Return ONLY valid JSON.`;

  let lastError: Error | null = null;

  // Outer retry attempts
  for (let attempt = 1; attempt <= 3; attempt++) {
    for (const model of CANDIDATE_MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: `${systemInstruction}\n\n${prompt}`,
          config: {
            responseMimeType: 'application/json',
            temperature: 0.2,
          },
        });

        const responseText = response.text?.trim();
        if (!responseText) {
          continue;
        }

        const parsed = JSON.parse(responseText);

        return {
          summary: typeof parsed.summary === 'string' ? parsed.summary : null,
          keyPoints: Array.isArray(parsed.keyPoints) ? parsed.keyPoints.filter((p: unknown): p is string => typeof p === 'string') : [],
          decisions: Array.isArray(parsed.decisions) ? parsed.decisions.filter((d: unknown): d is string => typeof d === 'string') : [],
          actionItems: Array.isArray(parsed.actionItems)
            ? parsed.actionItems.map((item: any) => ({
                text: String(item.text || ''),
                owner: item.owner ? String(item.owner) : null,
              })).filter((item: ActionItemGuess) => item.text.length > 0)
            : [],
        };
      } catch (err: any) {
        lastError = err;
        console.warn(`[Attempt ${attempt}] Model ${model} failed (${err.message}).`);
        // If 503 or 429, wait a short backoff before next model
        await new Promise(res => setTimeout(res, 1200));
      }
    }
    // Exponential backoff between round attempts
    if (attempt < 3) {
      const waitTime = attempt * 2500;
      console.log(`Waiting ${waitTime}ms before retry round ${attempt + 1}...`);
      await new Promise(res => setTimeout(res, waitTime));
    }
  }

  throw new Error(`All Gemini models failed after retries. Last error: ${lastError?.message}`);
}

function getEmptyIntelligence(): MeetingIntelligence {
  return {
    summary: null,
    keyPoints: [],
    decisions: [],
    actionItems: [],
  };
}

export type ProcessedMeeting = {
  transcript: { speaker: string; startSec: number; text: string }[];
  summary: string;
  decisions: string[];
  actionItems: { title: string; owner: string }[];
};

/**
 * Transcribes audio/video recording and extracts structured meeting intelligence via Gemini.
 * Specified in Docs/FEATURE_UPLOAD.md
 */
export async function processRecording(
  fileBase64: string,
  mimeType: string,
  timeoutMs: number = 20000
): Promise<ProcessedMeeting | null> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY is not set.');
    return null;
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `Transcribe this meeting recording with speaker labels and
approximate start times in seconds. Then extract a summary, decisions, and
action items. Return ONLY valid JSON, no markdown fences, matching:
{
  "transcript": [{"speaker": "...", "startSec": 0, "text": "..."}],
  "summary": "2-4 sentences",
  "decisions": ["..."],
  "actionItems": [{"title": "...", "owner": "best-guess name"}]
}`;

  const audioModels = ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-flash-latest'];

  const execute = async (): Promise<ProcessedMeeting | null> => {
    for (let attempt = 1; attempt <= 2; attempt++) {
      for (const model of audioModels) {
        try {
          console.log(`[Attempt ${attempt}] Sending recording to Gemini model: ${model}...`);
          const result = await ai.models.generateContent({
            model,
            contents: [
              {
                inlineData: {
                  data: fileBase64,
                  mimeType,
                },
              },
              {
                text: prompt,
              },
            ],
            config: {
              responseMimeType: 'application/json',
              temperature: 0.2,
            },
          });

          const raw = result.text?.trim().replace(/^```json\s*|```$/g, '') || '';
          if (!raw) {
            continue;
          }

          const parsed = JSON.parse(raw) as ProcessedMeeting;
          return {
            transcript: Array.isArray(parsed.transcript) ? parsed.transcript : [],
            summary: typeof parsed.summary === 'string' ? parsed.summary : '',
            decisions: Array.isArray(parsed.decisions) ? parsed.decisions : [],
            actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
          };
        } catch (err: any) {
          console.warn(`[Attempt ${attempt}] Gemini audio model ${model} attempt failed:`, err.message);
          await new Promise((r) => setTimeout(r, 600));
        }
      }
    }
    return null;
  };

  // Enforce strict timeout budget to guarantee response before gateway 504
  return Promise.race([
    execute(),
    new Promise<null>((resolve) =>
      setTimeout(() => {
        console.warn(`Gemini processing timed out after ${timeoutMs}ms; returning null for graceful fallback.`);
        resolve(null);
      }, timeoutMs)
    ),
  ]);
}
