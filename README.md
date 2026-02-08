# Demo Generator

Convert code updates into polished demo presentations with AI-generated slides and speaker scripts.

## Features

- **Paste & Generate**: Input git diffs, commit messages, or plain descriptions
- **4 Templates**: Weekly standup, sprint review, tech deep-dive, project kickoff
- **reveal.js Slides**: Interactive, syntax-highlighted presentations in the browser
- **Speaker Scripts**: Conversational, timed scripts for each slide
- **Export**: Download slides as standalone HTML, script as markdown, or narration as MP3 via OpenAI TTS

## Quick Start

```bash
cp .env.example .env
# Add your OpenAI API key to .env

npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Tech Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- reveal.js for slide rendering
- OpenAI GPT-4o for content generation
- OpenAI TTS-1 for narration

## API Routes

- `POST /api/generate` — Generate slides + script from input
- `POST /api/tts` — Convert text to speech (MP3)
