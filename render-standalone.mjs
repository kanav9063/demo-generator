#!/usr/bin/env node
// Standalone video renderer — bypasses Next.js dev server to save memory
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const FPS = 30;
const DEFAULT_DURATION = 8;

async function generateTTSOpenAI(text, outputPath) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("No OPENAI_API_KEY");

  const res = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "tts-1-hd",
      voice: "nova",
      input: text,
      response_format: "mp3",
    }),
  });

  if (!res.ok) throw new Error(`TTS failed: ${await res.text()}`);
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(outputPath, buffer);

  try {
    const result = execSync(
      `ffprobe -v quiet -show_entries format=duration -of csv=p=0 "${outputPath}"`,
      { encoding: "utf-8" }
    ).trim();
    return parseFloat(result) || DEFAULT_DURATION;
  } catch {
    return DEFAULT_DURATION;
  }
}

async function main() {
  const inputFile = process.argv[2] || "/tmp/presentation.json";
  const outputFile = process.argv[3] || "/tmp/demo-video-v2.mp4";

  console.log(`Reading presentation from ${inputFile}...`);
  const presentation = JSON.parse(fs.readFileSync(inputFile, "utf-8"));
  const { slides, title } = presentation;

  // Generate TTS audio
  const audioDir = "/tmp/render-audio";
  fs.mkdirSync(audioDir, { recursive: true });

  const slideData = [];
  const titleDuration = title ? Math.ceil(FPS * 3) : 0;
  let totalFrames = titleDuration;

  for (let i = 0; i < slides.length; i++) {
    const slide = slides[i];
    const audioPath = path.join(audioDir, `slide-${i}.mp3`);
    let durationSec = DEFAULT_DURATION;
    let audioUrl;

    if (slide.notes?.trim()) {
      console.log(`  TTS slide ${i + 1}/${slides.length}: "${slide.title}"...`);
      try {
        durationSec = await generateTTSOpenAI(slide.notes, audioPath);
        durationSec = Math.max(durationSec, 3) + 1;
        audioUrl = audioPath;
      } catch (e) {
        console.warn(`  TTS failed for slide ${i}:`, e.message);
      }
    }

    const durationInFrames = Math.ceil(durationSec * FPS);
    totalFrames += durationInFrames;
    slideData.push({ ...slide, audioDurationInFrames: durationInFrames, audioUrl });
  }

  console.log(`\nTotal duration: ${(totalFrames / FPS).toFixed(1)}s (${totalFrames} frames)`);

  // Bundle Remotion
  console.log("\nBundling Remotion composition...");
  const entryPoint = path.join(__dirname, "src", "remotion", "index.ts");
  const bundled = await bundle({
    entryPoint,
    webpackOverride: (config) => config,
  });

  // Copy audio to bundle
  const bundlePublicDir = path.join(bundled, "public");
  fs.mkdirSync(bundlePublicDir, { recursive: true });
  for (const s of slideData) {
    if (s.audioUrl) {
      const dest = path.join(bundlePublicDir, path.basename(s.audioUrl));
      fs.copyFileSync(s.audioUrl, dest);
    }
  }

  const inputProps = {
    slides: slideData.map((s) => ({
      ...s,
      audioUrl: s.audioUrl ? path.basename(s.audioUrl) : undefined,
    })),
    fps: FPS,
    totalDurationInFrames: totalFrames,
    presentationTitle: title || undefined,
  };

  console.log("Selecting composition...");
  const composition = await selectComposition({
    serveUrl: bundled,
    id: "DemoVideo",
    inputProps,
  });
  composition.durationInFrames = totalFrames;
  composition.fps = FPS;

  console.log(`Rendering ${totalFrames} frames to ${outputFile}...`);
  await renderMedia({
    composition,
    serveUrl: bundled,
    codec: "h264",
    outputLocation: outputFile,
    inputProps,
    onProgress: ({ progress }) => {
      if (Math.round(progress * 100) % 10 === 0) {
        process.stdout.write(`\r  Progress: ${Math.round(progress * 100)}%`);
      }
    },
  });

  console.log(`\n\n✅ Video rendered: ${outputFile}`);
  const stat = fs.statSync(outputFile);
  console.log(`   Size: ${(stat.size / 1024 / 1024).toFixed(1)} MB`);

  // Cleanup
  fs.rmSync(audioDir, { recursive: true, force: true });
}

main().catch((e) => {
  console.error("❌ Render failed:", e);
  process.exit(1);
});
