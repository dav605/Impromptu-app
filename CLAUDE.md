# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Softskills** is an AI-powered speech coaching web app that helps users practice impromptu speaking, interviews, and rehearsed presentations with real-time feedback.

**Tech Stack:** React 19, Vite 5, Tailwind CSS v4, Framer Motion, Lucide React, Recharts

## Commands

```bash
# Install dependencies
npm install

# Development server (port 5173)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint
```

## Architecture

**Three-tab application:** Home (landing), Practice (core coaching), Analytics (session history)

**Practice Modes:** Impromptu, Rehearsal, Interview — each generates context-appropriate prompts via Puter AI

**Data Flow:**
1. User selects mode and gets AI-generated prompt
2. Real-time speech transcription via AssemblyAI WebSocket (16kHz PCM16)
3. Speech analyzed by Puter AI (gpt-4o-mini) for metrics and feedback
4. Sessions persisted to Supabase for analytics/history

**API Services:**
- **AssemblyAI**: Live speech-to-text via WebSocket with CORS proxy token minting
- **Puter AI**: Prompt generation and speech analysis (uses gpt-4o-mini)
- **Supabase**: Session storage with `sessions` table

**Key Files:**
- `src/App.jsx` — Main app shell with tab routing and state orchestration
- `src/hooks/useSpeechRecognition.js` — AssemblyAI WebSocket integration, audio processing, PCM16 conversion
- `src/hooks/usePuter.js` — Optional Puter auth for API key storage (falls back to env vars)
- `src/services/GeminiService.js` — Speech analysis with structured JSON output
- `src/components/CoachDashboard.jsx` — Recording UI, mode selection, live transcript
- `src/components/FeedbackResults.jsx` — Analysis visualization (scores, metrics, feedback)
- `src/components/AnalyticsDashboard.jsx` — Historical sessions from Supabase

**Styling:** Tailwind CSS v4 with `@theme` block for custom colors (`--color-brand-primary: #0ea5e9`). Dark theme with slate color palette.

## Environment Setup

Create `.env` file in project root:
```
VITE_ASSEMBLYAI_API_KEY=your_assemblyai_key
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get AssemblyAI key from: https://www.assemblyai.com
Get Supabase credentials from: https://supabase.com
