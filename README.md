# Fathom — AI Meeting Intelligence

A Fathom-inspired meeting intelligence application that turns recorded conversations into searchable, structured, and actionable knowledge.

**Live Demo:** https://fathom-five-rho.vercel.app/
**Repository:** https://github.com/sheix-khizar/fathom

## Overview

This project was built as a time-boxed rebuild of the core Fathom experience.

The product focuses on the **post-meeting intelligence workflow**:

* Review meeting recordings
* Navigate synchronized transcripts
* Generate structured AI-style summaries
* Extract and manage action items
* Search across meetings and transcript content
* Jump directly to relevant moments
* Apply meeting-specific summary templates
* Share specific meeting clips through public zero-login links

The application uses realistic seeded meeting data to demonstrate the complete product experience.

## Key Features

### Meeting Intelligence

* Meeting dashboard with productivity metrics
* Meeting directory with categories and metadata
* Meeting detail pages
* Playback controls
* Seek and playback-speed controls
* Synchronized transcript
* Timestamp-based transcript navigation

### AI Summary

* Executive overview
* Key discussion themes
* Decisions made
* Structured meeting insights

### Action Items

* Assigned owners
* Due dates
* Priority indicators
* Interactive completion states

### Cross-Meeting Search

* Search meeting titles
* Search transcript content
* Timestamped search results
* Deep-link directly to the relevant moment in a meeting

### Templates

Includes specialized meeting templates such as:

* 1:1 Sync
* Weekly Team Sync
* Customer Discovery
* Sales Call
* Interview
* Project Kickoff
* Executive Brief

Templates dynamically update the summary preview to demonstrate different meeting-specific output structures.

### Clip Sharing

* Select and share meeting highlights
* Public clip URLs
* Zero-login public viewing
* Scoped transcript for the shared section
* Meeting context and key takeaways
* Graceful invalid/expired-link handling

## Product Flow

```text
Dashboard
   ↓
Meetings
   ↓
Meeting Detail
   ↓
Playback + Transcript
   ↓
AI Summary
   ↓
Action Items
   ↓
Search
   ↓
Templates
   ↓
Highlight / Share Clip
   ↓
Public Zero-Login Share Page
```

## Tech Stack

* Next.js
* React
* TypeScript
* Tailwind CSS
* Next.js App Router
* Vercel
* Seeded local application data

## Project Structure

```text
app/
├── calendar/
├── meetings/
├── search/
├── share/
├── templates/
└── page.tsx

components/
├── calendar/
├── dashboard/
├── layout/
├── meeting/
├── search/
├── share/
├── templates/
└── transcript/

lib/
├── data/
└── utils/

public/
.agent-logs/
CAPTURE-TEST.md
```

## Running Locally

Clone the repository:

```bash
git clone https://github.com/sheix-khizar/fathom.git
cd fathom
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

## Production Checks

The application has been verified with:

```bash
npx tsc --noEmit
npm run lint
npm run build
```

The production deployment has also been tested through the public Vercel URL, including the major application routes, logged-out access, meeting playback, transcript navigation, search, templates, and public clip sharing.

## Assignment Scope

The assignment explicitly allowed the meeting capture layer to be stubbed.

Because this was a time-boxed rebuild, development effort was intentionally prioritized toward the user-facing **post-meeting intelligence experience** rather than building a production-grade meeting bot for Zoom, Google Meet, or Microsoft Teams.

The implemented experience demonstrates:

* Meeting review
* Playback
* Transcript synchronization
* AI-style meeting summaries
* Action items
* Search
* Timestamp deep linking
* Meeting templates
* Public clip sharing

The capture/recording layer can be replaced with a real meeting ingestion pipeline in a production implementation.

## Demo

Use the live deployment to explore the complete workflow:

**Dashboard → Meeting → Playback → Transcript → AI Summary → Action Items → Search → Templates → Share Clip**

**Live Demo:** https://fathom-five-rho.vercel.app/
