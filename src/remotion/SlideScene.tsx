import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Audio,
  staticFile,
  Img,
} from "remotion";
import type { SlideData } from "./types";

// Strip HTML tags for caption display
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').trim();
}

// Extract code blocks from HTML content
function extractCodeBlocks(html: string): string[] {
  const codeRegex = /<code[^>]*>([\s\S]*?)<\/code>/gi;
  const blocks: string[] = [];
  let match;
  while ((match = codeRegex.exec(html)) !== null) {
    blocks.push(stripHtml(match[1]));
  }
  return blocks;
}

// Extract bullet points from HTML
function extractBullets(html: string): string[] {
  const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
  const bullets: string[] = [];
  let match;
  while ((match = liRegex.exec(html)) !== null) {
    bullets.push(stripHtml(match[1]));
  }
  return bullets;
}

interface SlideSceneProps {
  slide: SlideData;
  durationInFrames: number;
}

export const SlideScene: React.FC<SlideSceneProps> = ({ slide, durationInFrames }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeInDuration = Math.min(fps * 0.5, 15);
  const fadeOutStart = durationInFrames - Math.min(fps * 0.3, 10);

  const opacity = interpolate(
    frame,
    [0, fadeInDuration, fadeOutStart, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const titleY = interpolate(frame, [0, fadeInDuration], [30, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const codeBlocks = extractCodeBlocks(slide.content);
  const bullets = extractBullets(slide.content);

  // Stagger bullet animations
  const bulletDelay = fps * 0.3;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        padding: 60,
        display: "flex",
        flexDirection: "column",
        opacity,
      }}
    >
      {/* Audio */}
      {slide.audioUrl && <Audio src={staticFile(slide.audioUrl)} volume={1} />}

      {/* Title */}
      <div
        style={{
          transform: `translateY(${titleY}px)`,
          marginBottom: 40,
        }}
      >
        <h1
          style={{
            color: "#f8fafc",
            fontSize: 56,
            fontWeight: 700,
            margin: 0,
            lineHeight: 1.2,
          }}
        >
          {slide.title}
        </h1>
        <div
          style={{
            width: 120,
            height: 4,
            backgroundColor: "#6366f1",
            borderRadius: 2,
            marginTop: 16,
          }}
        />
      </div>

      {/* Content area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 24, overflow: "hidden" }}>
        {/* Bullet points */}
        {bullets.length > 0 && (
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {bullets.map((bullet, i) => {
              const bulletOpacity = interpolate(
                frame,
                [fadeInDuration + i * bulletDelay, fadeInDuration + i * bulletDelay + 10],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              const bulletX = interpolate(
                frame,
                [fadeInDuration + i * bulletDelay, fadeInDuration + i * bulletDelay + 10],
                [20, 0],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <li
                  key={i}
                  style={{
                    color: "#cbd5e1",
                    fontSize: 32,
                    lineHeight: 1.6,
                    opacity: bulletOpacity,
                    transform: `translateX(${bulletX}px)`,
                    marginBottom: 8,
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                  }}
                >
                  <span style={{ color: "#6366f1", fontSize: 24, marginTop: 6 }}>●</span>
                  <span>{bullet}</span>
                </li>
              );
            })}
          </ul>
        )}

        {/* Code blocks */}
        {codeBlocks.length > 0 && (
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
            {codeBlocks.map((code, i) => {
              const codeOpacity = interpolate(
                frame,
                [fadeInDuration + bullets.length * bulletDelay + i * 10, fadeInDuration + bullets.length * bulletDelay + i * 10 + 15],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <pre
                  key={i}
                  style={{
                    backgroundColor: "#1e293b",
                    borderRadius: 12,
                    padding: 24,
                    margin: 0,
                    overflow: "hidden",
                    opacity: codeOpacity,
                    border: "1px solid #334155",
                  }}
                >
                  <code
                    style={{
                      color: "#e2e8f0",
                      fontSize: 22,
                      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                      lineHeight: 1.5,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {code}
                  </code>
                </pre>
              );
            })}
          </div>
        )}

        {/* Fallback: plain text if no bullets/code */}
        {bullets.length === 0 && codeBlocks.length === 0 && (
          <p style={{ color: "#cbd5e1", fontSize: 32, lineHeight: 1.6, margin: 0 }}>
            {stripHtml(slide.content)}
          </p>
        )}
      </div>

      {/* Caption overlay at bottom */}
      {slide.notes && (
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: 60,
            right: 60,
            backgroundColor: "rgba(0,0,0,0.7)",
            borderRadius: 8,
            padding: "12px 20px",
          }}
        >
          <p
            style={{
              color: "#e2e8f0",
              fontSize: 20,
              margin: 0,
              lineHeight: 1.4,
              textAlign: "center",
              maxHeight: 60,
              overflow: "hidden",
            }}
          >
            {slide.notes.slice(0, 200)}{slide.notes.length > 200 ? "..." : ""}
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};
