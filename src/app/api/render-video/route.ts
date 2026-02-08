import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import os from "os";

export const maxDuration = 300; // 5 min timeout

interface SlideInput {
  title: string;
  content: string;
  notes: string;
}

interface RenderRequest {
  title: string;
  slides: SlideInput[];
}

const FPS = 30;
const DEFAULT_SLIDE_DURATION_SEC = 8;

async function generateTTSElevenLabs(
  text: string,
  outputPath: string
): Promise<number> {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey) throw new Error("No ELEVENLABS_API_KEY");

  const voiceId = "21m00Tcm4TlvDq8ikWAM"; // Rachel
  const res = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_monolingual_v1",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs TTS failed: ${err}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  return getAudioDuration(outputPath);
}

async function generateTTSOpenAI(
  text: string,
  outputPath: string
): Promise<number> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No OPENAI_API_KEY");

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1",
      voice: "nova",
      input: text,
      response_format: "mp3",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI TTS failed: ${err}`);
  }

  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);
  return getAudioDuration(outputPath);
}

function getAudioDuration(filePath: string): number {
  // Use ffprobe to get duration
  const { execSync } = require("child_process");
  try {
    const result = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${filePath}"`,
      { encoding: "utf-8" }
    ).trim();
    return parseFloat(result) || DEFAULT_SLIDE_DURATION_SEC;
  } catch {
    return DEFAULT_SLIDE_DURATION_SEC;
  }
}

async function generateTTS(text: string, outputPath: string): Promise<number> {
  // Try ElevenLabs first, fall back to OpenAI
  if (process.env.ELEVENLABS_API_KEY) {
    try {
      return await generateTTSElevenLabs(text, outputPath);
    } catch (e) {
      console.warn("ElevenLabs failed, falling back to OpenAI:", e);
    }
  }
  return await generateTTSOpenAI(text, outputPath);
}

export async function POST(req: NextRequest) {
  try {
    const body: RenderRequest = await req.json();
    const { slides } = body;

    if (!slides || slides.length === 0) {
      return NextResponse.json({ error: "No slides provided" }, { status: 400 });
    }

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "demo-video-"));
    const audioDir = path.join(tmpDir, "audio");
    fs.mkdirSync(audioDir, { recursive: true });

    // Generate TTS for each slide
    const slideData = [];
    let totalFrames = 0;

    for (let i = 0; i < slides.length; i++) {
      const slide = slides[i];
      const audioPath = path.join(audioDir, `slide-${i}.mp3`);
      let durationSec = DEFAULT_SLIDE_DURATION_SEC;
      let audioUrl: string | undefined;

      if (slide.notes && slide.notes.trim().length > 0) {
        try {
          durationSec = await generateTTS(slide.notes, audioPath);
          durationSec = Math.max(durationSec, 3); // minimum 3 seconds
          durationSec += 1; // add 1s buffer
          audioUrl = audioPath;
        } catch (e) {
          console.warn(`TTS failed for slide ${i}:`, e);
        }
      }

      const durationInFrames = Math.ceil(durationSec * FPS);
      totalFrames += durationInFrames;

      slideData.push({
        ...slide,
        audioDurationInFrames: durationInFrames,
        audioUrl,
      });
    }

    // Dynamic import of Remotion (server-side only)
    const { bundle } = await import("@remotion/bundler");
    const { renderMedia, selectComposition } = await import("@remotion/renderer");

    // Bundle the Remotion project
    const entryPoint = path.join(
      process.cwd(),
      "src",
      "remotion",
      "index.ts"
    );

    console.log("Bundling Remotion composition...");
    const bundled = await bundle({
      entryPoint,
      webpackOverride: (config) => config,
    });

    const inputProps = {
      slides: slideData.map((s, i) => ({
        ...s,
        // For Remotion, audio needs to be served. We'll use staticFile or inline.
        // Since we're server-side rendering, we use the absolute path.
        audioUrl: s.audioUrl ? `file://${s.audioUrl}` : undefined,
      })),
      fps: FPS,
      totalDurationInFrames: totalFrames,
    };

    console.log("Selecting composition...");
    const composition = await selectComposition({
      serveUrl: bundled,
      id: "DemoVideo",
      inputProps,
    });

    // Override duration from our calculated total
    composition.durationInFrames = totalFrames;
    composition.fps = FPS;

    const outputPath = path.join(tmpDir, "output.mp4");

    console.log(`Rendering ${totalFrames} frames (${(totalFrames / FPS).toFixed(1)}s)...`);
    await renderMedia({
      composition,
      serveUrl: bundled,
      codec: "h264",
      outputLocation: outputPath,
      inputProps,
    });

    console.log("Render complete!");

    // Read the output file and return it
    const videoBuffer = fs.readFileSync(outputPath);

    // Clean up temp files
    fs.rmSync(tmpDir, { recursive: true, force: true });

    return new NextResponse(videoBuffer, {
      headers: {
        "Content-Type": "video/mp4",
        "Content-Disposition": `attachment; filename="demo-video.mp4"`,
        "Content-Length": videoBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Video render error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Render failed",
        details: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
