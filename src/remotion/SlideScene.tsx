import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Audio,
  staticFile,
} from "remotion";
import type { SlideData } from "./types";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim();
}

function extractCodeBlocks(html: string): string[] {
  const codeRegex = /<code[^>]*>([\s\S]*?)<\/code>/gi;
  const blocks: string[] = [];
  let match;
  while ((match = codeRegex.exec(html)) !== null) {
    blocks.push(stripHtml(match[1]));
  }
  return blocks;
}

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
  slideIndex: number;
  totalSlides: number;
}

export const SlideScene: React.FC<SlideSceneProps> = ({
  slide,
  durationInFrames,
  slideIndex,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const codeBlocks = extractCodeBlocks(slide.content);
  const bullets = extractBullets(slide.content);
  const hasCode = codeBlocks.length > 0;

  // --- Animations ---
  // Slide entrance
  const enterSpring = spring({ frame, fps, config: { damping: 18, stiffness: 90 } });
  const slideOpacity = interpolate(enterSpring, [0, 1], [0, 1]);
  const slideScale = interpolate(enterSpring, [0, 1], [0.97, 1]);

  // Fade out
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 12, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Title entrance
  const titleSpring = spring({ frame, fps, config: { damping: 14, stiffness: 100 } });
  const titleX = interpolate(titleSpring, [0, 1], [-40, 0]);

  // Accent line
  const lineWidth = interpolate(frame, [5, 20], [0, 80], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Progress bar
  const progress = (slideIndex + 1) / totalSlides;

  // Caption animation (word-level reveal)
  const captionDelay = 15;
  const captionWords = slide.notes ? slide.notes.split(" ") : [];
  const wordsPerSecond = captionWords.length / (durationInFrames / fps);
  const captionFramesPerWord = Math.max(1, fps / wordsPerSecond);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0f172a",
        fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
        opacity: slideOpacity * fadeOut,
        transform: `scale(${slideScale})`,
      }}
    >
      {/* Audio */}
      {slide.audioUrl && <Audio src={staticFile(slide.audioUrl)} volume={1} />}

      {/* Subtle gradient overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.06) 0%, transparent 60%)",
        }}
      />

      {/* Top progress bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          backgroundColor: "rgba(255,255,255,0.05)",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${progress * 100}%`,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            transition: "width 0.3s",
          }}
        />
      </div>

      {/* Slide counter */}
      <div
        style={{
          position: "absolute",
          top: 28,
          right: 48,
          color: "#475569",
          fontSize: 16,
          fontWeight: 600,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: "0.05em",
        }}
      >
        {String(slideIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
      </div>

      {/* Main content area */}
      <div
        style={{
          padding: "56px 64px 120px 64px",
          display: "flex",
          flexDirection: "column",
          height: "100%",
        }}
      >
        {/* Title */}
        <div
          style={{
            transform: `translateX(${titleX}px)`,
            marginBottom: 36,
            flexShrink: 0,
          }}
        >
          <h1
            style={{
              color: "#f1f5f9",
              fontSize: 52,
              fontWeight: 700,
              margin: 0,
              lineHeight: 1.15,
              letterSpacing: "-0.01em",
            }}
          >
            {slide.title}
          </h1>
          <div
            style={{
              width: lineWidth,
              height: 3,
              background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
              borderRadius: 2,
              marginTop: 14,
            }}
          />
        </div>

        {/* Content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: hasCode ? "row" : "column",
            gap: hasCode ? 40 : 16,
            overflow: "hidden",
          }}
        >
          {/* Bullets */}
          {bullets.length > 0 && (
            <div style={{ flex: hasCode ? "0 0 45%" : 1, display: "flex", flexDirection: "column", gap: 0 }}>
              {bullets.map((bullet, i) => {
                const bulletSpring = spring({
                  frame: Math.max(0, frame - 8 - i * 8),
                  fps,
                  config: { damping: 16, stiffness: 100 },
                });
                const bulletOpacity = interpolate(bulletSpring, [0, 1], [0, 1]);
                const bulletX = interpolate(bulletSpring, [0, 1], [30, 0]);

                return (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 18,
                      opacity: bulletOpacity,
                      transform: `translateX(${bulletX}px)`,
                      padding: "12px 0",
                    }}
                  >
                    {/* Bullet indicator */}
                    <div
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: "50%",
                        backgroundColor: "#6366f1",
                        marginTop: 12,
                        flexShrink: 0,
                        boxShadow: "0 0 8px rgba(99,102,241,0.4)",
                      }}
                    />
                    <span
                      style={{
                        color: "#e2e8f0",
                        fontSize: 30,
                        lineHeight: 1.5,
                        fontWeight: 400,
                      }}
                    >
                      {bullet}
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Code blocks */}
          {codeBlocks.length > 0 && (
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                gap: 16,
              }}
            >
              {codeBlocks.map((code, i) => {
                const codeSpring = spring({
                  frame: Math.max(0, frame - 12 - bullets.length * 8 - i * 8),
                  fps,
                  config: { damping: 16, stiffness: 80 },
                });
                const codeOpacity = interpolate(codeSpring, [0, 1], [0, 1]);
                const codeY = interpolate(codeSpring, [0, 1], [20, 0]);

                // Typewriter effect for code
                const codeChars = code.length;
                const revealStart = 15 + bullets.length * 8 + i * 8;
                const charsRevealed = Math.floor(
                  interpolate(
                    frame,
                    [revealStart, revealStart + codeChars * 0.8],
                    [0, codeChars],
                    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                  )
                );

                return (
                  <div
                    key={i}
                    style={{
                      opacity: codeOpacity,
                      transform: `translateY(${codeY}px)`,
                      position: "relative",
                    }}
                  >
                    {/* Window chrome */}
                    <div
                      style={{
                        backgroundColor: "#0d1117",
                        borderRadius: "12px 12px 0 0",
                        padding: "10px 16px",
                        display: "flex",
                        gap: 8,
                        alignItems: "center",
                      }}
                    >
                      <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
                      <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#febc2e" }} />
                      <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#28c840" }} />
                      <span
                        style={{
                          color: "#484f58",
                          fontSize: 13,
                          marginLeft: 12,
                          fontFamily: "'JetBrains Mono', monospace",
                        }}
                      >
                        code
                      </span>
                    </div>
                    <pre
                      style={{
                        backgroundColor: "#0d1117",
                        borderRadius: "0 0 12px 12px",
                        padding: "20px 24px",
                        margin: 0,
                        overflow: "hidden",
                        border: "1px solid #21262d",
                        borderTop: "none",
                      }}
                    >
                      <code
                        style={{
                          color: "#c9d1d9",
                          fontSize: 20,
                          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                          lineHeight: 1.6,
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {code.slice(0, charsRevealed)}
                        {charsRevealed < codeChars && (
                          <span
                            style={{
                              backgroundColor: "#6366f1",
                              color: "#6366f1",
                              width: 2,
                              display: "inline-block",
                            }}
                          >
                            |
                          </span>
                        )}
                      </code>
                    </pre>
                  </div>
                );
              })}
            </div>
          )}

          {/* Fallback plain text */}
          {bullets.length === 0 && codeBlocks.length === 0 && (
            <p
              style={{
                color: "#cbd5e1",
                fontSize: 30,
                lineHeight: 1.6,
                margin: 0,
              }}
            >
              {stripHtml(slide.content)}
            </p>
          )}
        </div>
      </div>

      {/* Caption overlay */}
      {slide.notes && (
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            background:
              "linear-gradient(transparent, rgba(0,0,0,0.85) 30%)",
            padding: "40px 64px 32px 64px",
          }}
        >
          <p
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 19,
              margin: 0,
              lineHeight: 1.5,
              textAlign: "center",
              fontWeight: 400,
            }}
          >
            {/* Show words progressively synced to narration */}
            {captionWords.map((word, wi) => {
              const wordFrame = captionDelay + wi * captionFramesPerWord;
              const wordOpacity = interpolate(
                frame,
                [wordFrame, wordFrame + 3],
                [0.3, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              );
              return (
                <span key={wi} style={{ opacity: wordOpacity }}>
                  {word}{" "}
                </span>
              );
            })}
          </p>
        </div>
      )}
    </AbsoluteFill>
  );
};
