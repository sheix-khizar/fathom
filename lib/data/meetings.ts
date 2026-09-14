import { Meeting, ShareClip, SummaryTemplate } from "@/lib/types";

export const SUMMARY_TEMPLATES: SummaryTemplate[] = [
  {
    id: "one-on-one",
    name: "1:1 Sync",
    description: "Focuses on personal growth, priorities alignment, blockers, feedback exchange, and agreed next steps.",
  },
  {
    id: "weekly-team-sync",
    name: "Weekly Team Sync",
    description: "Captures team accomplishments, cross-functional dependencies, upcoming sprint goals, and roadblocks.",
  },
  {
    id: "customer-discovery",
    name: "Customer Discovery",
    description: "Extracts customer pain points, current workarounds, feature requests, budget constraints, and willingness to pay.",
  },
  {
    id: "sales-call",
    name: "Sales Call",
    description: "Summarizes client buying signals, objections raised, competitors evaluated, timeline, and deal next steps.",
  },
  {
    id: "interview",
    name: "Interview",
    description: "Evaluates candidate technical competency, cultural fit, key strengths, red flags, and hiring recommendation.",
  },
  {
    id: "project-kickoff",
    name: "Project Kickoff",
    description: "Outlines project scope, deliverables, key milestones, RACI matrix, risks, and communication cadences.",
  },
  {
    id: "executive-brief",
    name: "Executive Brief",
    description: "High-level strategic takeaway format focusing on business impact, high-stakes decisions, and resource allocation.",
  },
];

export const SEED_MEETINGS: Meeting[] = [
  {
    id: "product-strategy-q4",
    title: "Product Strategy — Q4 Roadmap",
    date: "2026-09-10",
    durationSec: 1845,
    participants: ["Sarah Chen", "Alex Rivera", "David Kim", "Elena Rostova"],
    recordingUrl: "/media/sample-meeting.mp4",
    summary: {
      overview:
        "Quarterly roadmap review establishing core product priorities: self-serve enterprise onboarding, instant transcript sharing with zero login, and deeper CRM webhook integrations.",
      keyPoints: [
        "Enterprise inbound interest for automated call indexing surged 45% over the past month.",
        "User retention strongly correlates with sharing clips to external stakeholders within 2 hours of call completion.",
        "Calendar sync reliability is the primary friction point during initial user activation.",
      ],
      decisions: [
        "Prioritize the public shareable clip workflow without authentication for Q4 milestone 1.",
        "Sunset the legacy audio pipeline and migrate 100% of diarization to streaming deepgram nova-2.",
        "Allocate two dedicated engineers to calendar permission fault tolerance and reconnect flows.",
      ],
    },
    transcript: [
      {
        id: "t1-1",
        speaker: "Sarah Chen",
        timestampSec: 0,
        text: "Good morning everyone. Let's dive straight into the Q4 roadmap priorities. We have 30 minutes.",
      },
      {
        id: "t1-2",
        speaker: "Alex Rivera",
        timestampSec: 42,
        text: "Thanks Sarah. Looking at our usage data from August, user retention jumps by 3x when a user shares at least one meeting clip outside their organization.",
      },
      {
        id: "t1-3",
        speaker: "Elena Rostova",
        timestampSec: 115,
        text: "That aligns with what marketing is seeing. People want to send a 45-second snippet to clients or investors without forcing them into a sign-up wall.",
      },
      {
        id: "t1-4",
        speaker: "David Kim",
        timestampSec: 198,
        text: "From the infrastructure side, generating shareable tokens with pre-signed video windows is straightforward and secure.",
      },
      {
        id: "t1-5",
        speaker: "Sarah Chen",
        timestampSec: 284,
        text: "Agreed. What about calendar synchronization? We had several reports of missed recording bot joins last week.",
      },
      {
        id: "t1-6",
        speaker: "David Kim",
        timestampSec: 360,
        text: "Google Calendar webhook renewal delays were the culprit. We are refactoring the token refresher to renew proactively 4 hours before expiration.",
      },
      {
        id: "t1-7",
        speaker: "Alex Rivera",
        timestampSec: 512,
        text: "Can we also ensure the AI summary templates allow toggling between an executive brief and action items?",
      },
      {
        id: "t1-8",
        speaker: "Sarah Chen",
        timestampSec: 645,
        text: "Yes, customers love custom summary views. Let's make template switching instant on the meeting detail page.",
      },
      {
        id: "t1-9",
        speaker: "Elena Rostova",
        timestampSec: 890,
        text: "I will coordinate with design to make sure the tabbed layout for Overview, Transcript, and Action Items is clean and uncluttered.",
      },
      {
        id: "t1-10",
        speaker: "David Kim",
        timestampSec: 1180,
        text: "I'll also deploy the streaming transcript click-to-seek handler so clicking any line immediately seeks the video player.",
      },
      {
        id: "t1-11",
        speaker: "Sarah Chen",
        timestampSec: 1510,
        text: "Let's lock these 3 deliverables for Q4: Public clips, template switching, and click-to-seek playback sync.",
      },
      {
        id: "t1-12",
        speaker: "Alex Rivera",
        timestampSec: 1780,
        text: "Sounds great. I'll update Jira and circulate the finalized roadmap deck by EOD.",
      },
    ],
    actionItems: [
      {
        id: "a1-1",
        title: "Deploy public clip generation endpoint with zero-auth playback",
        owner: "David Kim",
        completed: false,
      },
      {
        id: "a1-2",
        title: "Deliver high-fidelity tab switcher mockups for meeting detail",
        owner: "Elena Rostova",
        completed: true,
      },
      {
        id: "a1-3",
        title: "Update Q4 roadmap documentation with calendar sync fixes",
        owner: "Alex Rivera",
        completed: false,
      },
    ],
  },
  {
    id: "weekly-eng-sync",
    title: "Weekly Engineering Sync",
    date: "2026-09-11",
    durationSec: 1420,
    participants: ["David Kim", "Marcus Vance", "Priya Patel", "Rachel Zhao"],
    recordingUrl: "/media/sample-meeting.mp4",
    summary: {
      overview:
        "Engineering sprint sync focusing on reducing speech diarization latency, optimizing database connection pooling during peak morning loads, and frontend state synchronization.",
      keyPoints: [
        "Audio chunking pipeline optimizations reduced transcription latency from 1.2s to 420ms.",
        "PostgreSQL connection spikes occur between 9:00 AM and 10:30 AM EST when morning standup recordings process.",
        "Player timeupdate events should throttle state dispatches to maintain 60 FPS scrolling on 5,000-word transcripts.",
      ],
      decisions: [
        "Deploy PgBouncer in transaction mode before Monday morning to buffer connection bursts.",
        "Throttle transcript active-line highlight updates with requestAnimationFrame.",
        "Lock package versions for Next.js 16 and Tailwind CSS v4 in production builds.",
      ],
    },
    transcript: [
      {
        id: "t2-1",
        speaker: "David Kim",
        timestampSec: 0,
        text: "Welcome team. Let's do a quick round of updates. Marcus, how is the diarization pipeline looking?",
      },
      {
        id: "t2-2",
        speaker: "Marcus Vance",
        timestampSec: 45,
        text: "We successfully reduced speech-to-text latency down to 420 milliseconds by moving to smaller sliding window audio chunks.",
      },
      {
        id: "t2-3",
        speaker: "Priya Patel",
        timestampSec: 180,
        text: "That's fantastic. On the frontend, I noticed that syncing the active transcript line while the video plays was causing unnecessary re-renders.",
      },
      {
        id: "t2-4",
        speaker: "Rachel Zhao",
        timestampSec: 310,
        text: "Did you wrap the time listener in a throttled animation frame?",
      },
      {
        id: "t2-5",
        speaker: "Priya Patel",
        timestampSec: 430,
        text: "Yes, exactly. Now it only triggers state updates when crossing a transcript boundary, keeping CPU usage below 2%.",
      },
      {
        id: "t2-6",
        speaker: "David Kim",
        timestampSec: 620,
        text: "Good catch. What about the database connection warnings we saw on Monday morning?",
      },
      {
        id: "t2-7",
        speaker: "Marcus Vance",
        timestampSec: 780,
        text: "We hit our pool limit when 80 meetings completed simultaneously at 9:30 AM. PgBouncer will solve this completely.",
      },
      {
        id: "t2-8",
        speaker: "Rachel Zhao",
        timestampSec: 960,
        text: "I tested the search indexing utility on 500 meeting transcripts; memory usage is under 12MB with instant keyword matches.",
      },
      {
        id: "t2-9",
        speaker: "David Kim",
        timestampSec: 1140,
        text: "Awesome work. Let's get the PgBouncer configuration reviewed and staged today.",
      },
      {
        id: "t2-10",
        speaker: "Priya Patel",
        timestampSec: 1320,
        text: "I'll push the transcript auto-scroll animation fix right after this sync.",
      },
    ],
    actionItems: [
      {
        id: "a2-1",
        title: "Stage PgBouncer configuration for connection pooling",
        owner: "Marcus Vance",
        completed: false,
      },
      {
        id: "a2-2",
        title: "Commit frontend transcript sync scroll optimization",
        owner: "Priya Patel",
        completed: true,
      },
      {
        id: "a2-3",
        title: "Verify search utility benchmark tests on large transcripts",
        owner: "Rachel Zhao",
        completed: true,
      },
    ],
  },
  {
    id: "customer-discovery-call",
    title: "Customer Discovery Call — Acme Corp",
    date: "2026-09-12",
    durationSec: 2100,
    participants: ["Sarah Chen", "Jordan Taylor", "Liam Walker"],
    recordingUrl: "/media/sample-meeting.mp4",
    summary: {
      overview:
        "Discovery interview with Acme Corp's VP of Product (Jordan Taylor) and Lead Architect (Liam Walker) evaluating Fathom for their 250-person distributed product organization.",
      keyPoints: [
        "Acme conducts roughly 450 Zoom and Google Meet calls weekly across product, design, and customer success.",
        "Their primary dissatisfaction with incumbent tools is lack of quick sharing and slow AI summary generation.",
        "They have strict security requirements regarding EU data residency and role-based access control.",
      ],
      decisions: [
        "Provision a pilot tenant for Acme with 25 product manager seats for a 14-day evaluation.",
        "Provide European data residency compliance documentation and SOC2 Type II report.",
        "Schedule follow-up security review with their InfoSec team for next Wednesday.",
      ],
    },
    transcript: [
      {
        id: "t3-1",
        speaker: "Sarah Chen",
        timestampSec: 0,
        text: "Hi Jordan and Liam, thanks for taking the time today. I'd love to understand your current meeting recording workflow at Acme.",
      },
      {
        id: "t3-2",
        speaker: "Jordan Taylor",
        timestampSec: 50,
        text: "Thanks Sarah. Right now our biggest problem is information silos. We have 450 calls a week, and nobody has time to re-watch hour-long recordings.",
      },
      {
        id: "t3-3",
        speaker: "Liam Walker",
        timestampSec: 190,
        text: "And when someone sends an email summary from other tools, it's often generic bullet points that miss technical context and actual decisions.",
      },
      {
        id: "t3-4",
        speaker: "Sarah Chen",
        timestampSec: 340,
        text: "In Fathom, we structure summaries into Overview, Key Points, and explicit Decisions, plus interactive timestamped action items.",
      },
      {
        id: "t3-5",
        speaker: "Jordan Taylor",
        timestampSec: 520,
        text: "Can our product designers easily clip a 30-second customer quote from a user interview and embed it into Notion or Slack without logging in?",
      },
      {
        id: "t3-6",
        speaker: "Sarah Chen",
        timestampSec: 680,
        text: "Yes, that's one of our core features. You highlight the transcript or select start/end times, generate a share token, and anyone with the link can view it instantly.",
      },
      {
        id: "t3-7",
        speaker: "Liam Walker",
        timestampSec: 920,
        text: "What about data compliance? We have several healthcare enterprise clients so EU data residency and strict encryption are hard gates.",
      },
      {
        id: "t3-8",
        speaker: "Sarah Chen",
        timestampSec: 1100,
        text: "We offer complete EU data isolation and SOC2 Type II compliance. I will send our audit package over right after this call.",
      },
      {
        id: "t3-9",
        speaker: "Jordan Taylor",
        timestampSec: 1450,
        text: "That sounds ideal. Can we pilot this with our 25-person Core Product team starting Monday?",
      },
      {
        id: "t3-10",
        speaker: "Sarah Chen",
        timestampSec: 1720,
        text: "Absolutely. I'll configure your pilot workspace and send invitations today.",
      },
      {
        id: "t3-11",
        speaker: "Liam Walker",
        timestampSec: 1980,
        text: "Looking forward to testing the search across all our team transcripts. Talk soon!",
      },
    ],
    actionItems: [
      {
        id: "a3-1",
        title: "Send SOC2 Type II and EU data residency security packet to Liam Walker",
        owner: "Sarah Chen",
        completed: true,
      },
      {
        id: "a3-2",
        title: "Provision Acme Corp 25-seat pilot organization workspace",
        owner: "Sarah Chen",
        completed: false,
      },
      {
        id: "a3-3",
        title: "Calendar follow-up security and architecture review for next Wednesday",
        owner: "Sarah Chen",
        completed: false,
      },
    ],
  },
  {
    id: "marketing-launch-planning",
    title: "Marketing Launch Planning — V2 Public Release",
    date: "2026-09-13",
    durationSec: 1680,
    participants: ["Elena Rostova", "Alex Rivera", "Chloe Martin", "Samir Mehta"],
    recordingUrl: "/media/sample-meeting.mp4",
    summary: {
      overview:
        "Go-to-market and promotional coordination for the Fathom V2 public launch, including Product Hunt campaign asset creation, developer newsletter sponsorships, and video walkthroughs.",
      keyPoints: [
        "Product Hunt launch date locked for Tuesday, October 6th at 00:01 PST.",
        "Interactive product demo video showcasing click-to-seek transcript sync completed first cut.",
        "Early access beta community generated 140 organic testimonials praising AI action item accuracy.",
      ],
      decisions: [
        "Lead launch messaging with 'Instant Meeting Intelligence with Zero Login Sharing'.",
        "Offer 30 days of unlimited AI summary templates to all launch week signups.",
        "Sponsor top 4 engineering newsletters with high-intent technical readership.",
      ],
    },
    transcript: [
      {
        id: "t4-1",
        speaker: "Elena Rostova",
        timestampSec: 0,
        text: "Hi everyone, let's review the final marketing checklist for the V2 public release.",
      },
      {
        id: "t4-2",
        speaker: "Chloe Martin",
        timestampSec: 60,
        text: "The hero product demo video is ready. It shows recording, instant summary generation, and generating a public clip in under 45 seconds.",
      },
      {
        id: "t4-3",
        speaker: "Samir Mehta",
        timestampSec: 190,
        text: "We also have the Product Hunt maker comment drafted, focusing on why existing meeting tools feel heavy and bloated compared to Fathom.",
      },
      {
        id: "t4-4",
        speaker: "Alex Rivera",
        timestampSec: 380,
        text: "Let's highlight the zero-friction share link. When someone receives a meeting clip, they should be able to watch it immediately on mobile or desktop without signing in.",
      },
      {
        id: "t4-5",
        speaker: "Elena Rostova",
        timestampSec: 540,
        text: "Completely agree. What is our plan for developer newsletters?",
      },
      {
        id: "t4-6",
        speaker: "Chloe Martin",
        timestampSec: 720,
        text: "We booked sponsored placements in TLDR, Bytes, and Frontend Focus for the week of October 6th.",
      },
      {
        id: "t4-7",
        speaker: "Samir Mehta",
        timestampSec: 960,
        text: "The landing page copy has been updated with social proof from our 140 beta teams.",
      },
      {
        id: "t4-8",
        speaker: "Elena Rostova",
        timestampSec: 1250,
        text: "Let's ensure the calendar view on the dashboard looks populated and active so demo users see the full value right away.",
      },
      {
        id: "t4-9",
        speaker: "Alex Rivera",
        timestampSec: 1480,
        text: "The seed data matches realistic team calls across product, eng, sales, and marketing.",
      },
      {
        id: "t4-10",
        speaker: "Elena Rostova",
        timestampSec: 1620,
        text: "Great! Let's do a final review of the media kit on Friday.",
      },
    ],
    actionItems: [
      {
        id: "a4-1",
        title: "Finalize Product Hunt assets and animated demo GIFs",
        owner: "Chloe Martin",
        completed: true,
      },
      {
        id: "a4-2",
        title: "Coordinate newsletter copy and tracking links for launch week",
        owner: "Chloe Martin",
        completed: false,
      },
      {
        id: "a4-3",
        title: "Stage marketing landing page comparison matrix",
        owner: "Samir Mehta",
        completed: false,
      },
    ],
  },
];

export const SEED_SHARE_CLIPS: ShareClip[] = [
  {
    id: "clip-1",
    meetingId: "product-strategy-q4",
    startSec: 42,
    endSec: 115,
    token: "q4-roadmap-highlight",
    createdAt: "2026-09-10T14:30:00Z",
  },
  {
    id: "clip-2",
    meetingId: "weekly-eng-sync",
    startSec: 45,
    endSec: 180,
    token: "latency-optimization",
    createdAt: "2026-09-11T16:00:00Z",
  },
  {
    id: "clip-3",
    meetingId: "customer-discovery-call",
    startSec: 340,
    endSec: 520,
    token: "acme-feedback",
    createdAt: "2026-09-12T11:45:00Z",
  },
  {
    id: "clip-4",
    meetingId: "marketing-launch-planning",
    startSec: 60,
    endSec: 380,
    token: "v2-launch-plan",
    createdAt: "2026-09-13T10:00:00Z",
  },
];

/**
 * Accessor functions for meeting data
 */
export function getMeetings(): Meeting[] {
  return SEED_MEETINGS;
}

export function getMeetingById(id: string): Meeting | undefined {
  return SEED_MEETINGS.find((m) => m.id === id);
}

export function getTemplates(): SummaryTemplate[] {
  return SUMMARY_TEMPLATES;
}

export function getShareClips(): ShareClip[] {
  return SEED_SHARE_CLIPS;
}

export function getClipsForMeeting(meetingId: string): ShareClip[] {
  return SEED_SHARE_CLIPS.filter((c) => c.meetingId === meetingId);
}

export function getClipByToken(token: string): { clip: ShareClip; meeting: Meeting } | undefined {
  const clip = SEED_SHARE_CLIPS.find((c) => c.token === token);
  if (!clip) return undefined;
  const meeting = getMeetingById(clip.meetingId);
  if (!meeting) return undefined;
  return { clip, meeting };
}
