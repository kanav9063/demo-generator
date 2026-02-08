# Demo Generator — Spec

## Overview
An engineer's partner that converts weekly tasks, code updates, and project progress into polished demo materials — slides, scripts, and optionally video.

## Core Features

### 1. Input Sources
- Git diff / commit history (auto-pull from repo)
- Manual task descriptions (markdown/text)
- Code snippets with annotations
- Optional: Jira/Linear/Notion integration (future)

### 2. Slide Generation
- Auto-generates presentation slides from code updates
- Uses reveal.js for HTML-based slides (no PowerPoint dependency)
- Sections: Overview → What Changed → Demo → Key Decisions → Next Steps
- Code snippets with syntax highlighting
- Architecture diagrams (mermaid.js)

### 3. Script Generation  
- Generates a spoken script per slide
- Conversational, engineer-friendly tone
- Timed to ~30s-1min per slide
- Export as markdown or teleprompter view

### 4. Video Generation (v2)
- Uses slides + script to generate a video
- Option 1: Slide recording with TTS narration (ElevenLabs/OpenAI TTS)
- Option 2: Export slides + script for manual recording
- Output: MP4 video with slides and voiceover

### 5. Templates
- Weekly standup demo
- Sprint review
- Technical deep-dive
- Project kickoff

## Tech Stack
- **Frontend:** Next.js + Tailwind CSS
- **Slides:** reveal.js embedded
- **LLM:** OpenAI GPT-4o for content generation
- **TTS:** OpenAI TTS-1 or ElevenLabs
- **Video:** puppeteer (slide capture) + ffmpeg (video assembly)
- **Git Integration:** simple-git

## UI
- Step 1: Connect repo or paste updates
- Step 2: Select template, customize sections
- Step 3: Review/edit generated slides + script
- Step 4: Export (slides HTML, script MD, video MP4)

## Setup
- `npm install && npm run dev`
- Set OPENAI_API_KEY in .env
- Optional: Set ELEVENLABS_API_KEY for premium TTS
