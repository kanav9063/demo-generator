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

interface SplitSceneProps {
  heading: string;
  accentWord?: string; // word to highlight in orange
  bullets: string[];
  codeBlock?: string;
  audioUrl?: string;
  notes?: string;
  slideIndex: number;
  totalSlides: number;
}

export const SplitScene: React.FC<SplitSceneProps> = ({
  heading,
  accentWord,
  bullets,
  codeBlock,
  audioUrl,
  notes,
  slideIndex,
  totalSlides,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const hasCode = !!codeBlock;

  // Heading entrance
  const headingSpring = spring({
    frame,
    fps,
    config: { damping: 16, stiffness: 80 },
  });
  const headingX = interpolate(headingSpring, [0, 1], [60, 0]);
  const headingOpacity = interpolate(headingSpring, [0, 1], [0, 1]);

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {audioUrl && <Audio src={staticFile(audioUrl)} volume={1} />}

      {/* Device frame look — rounded inner container */}
      <div
        style={{
          position: "absolute",
          inset: 24,
          borderRadius: 24,
          backgroundColor: "#141414",
          overflow: "hidden",
          display: "flex",
        }}
      >
        {/* LEFT SIDE — Text content */}
        <div
          style={{
            flex: hasCode ? "0 0 50%" : "1",
            padding: "64px 56px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          {/* Slide counter */}
          <div
            style={{
              fontSize: 14,
              fontWeight: 600,
              color: "#525252",
              fontFamily: "'JetBrains Mono', monospace",
              marginBottom: 24,
              letterSpacing: "0.1em",
            }}
          >
            {String(slideIndex + 1).padStart(2, "0")} / {String(totalSlides).padStart(2, "0")}
          </div>

          {/* Heading with optional accent word */}
          <h1
            style={{
              fontSize: hasCode ? 56 : 72,
              fontWeight: 800,
              fontFamily: "'Inter', system-ui, sans-serif",
              lineHeight: 1.1,
              letterSpacing: "-0.03em",
              margin: 0,
              marginBottom: 40,
              transform: `translateX(${headingX}px)`,
              opacity: headingOpacity,
            }}
          >
            {accentWord
              ? heading.split(accentWord).map((part, i, arr) => (
                  <React.Fragment key={i}>
                    <span style={{ color: "#fafafa" }}>{part}</span>
                    {i < arr.length - 1 && (
                      <span style={{ color: "#ea580c" }}>{accentWord}</span>
                    )}
                  </React.Fragment>
                ))
              : <span style={{ color: "#fafafa" }}>{heading}</span>
            }
          </h1>

          {/* Bullets */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {bullets.map((bullet, i) => {
              const bulletSpring = spring({
                frame: Math.max(0, frame - 10 - i * 6),
                fps,
                config: { damping: 16, stiffness: 90 },
              });
              const bulletX = interpolate(bulletSpring, [0, 1], [40, 0]);
              const bulletOpacity = interpolate(bulletSpring, [0, 1], [0, 1]);

              return (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 16,
                    transform: `translateX(${bulletX}px)`,
                    opacity: bulletOpacity,
                  }}
                >
                  <div
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      backgroundColor: "#ea580c",
                      marginTop: 14,
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      fontSize: 28,
                      fontWeight: 400,
                      color: "#d4d4d4",
                      fontFamily: "'Inter', system-ui, sans-serif",
                      lineHeight: 1.5,
                    }}
                  >
                    {bullet}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* RIGHT SIDE — Code / Visual */}
        {hasCode && (
          <div
            style={{
              flex: "0 0 50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "48px 40px 48px 0",
            }}
          >
            <CodeTerminal code={codeBlock} frame={frame} fps={fps} />
          </div>
        )}
      </div>

      {/* Caption bar at very bottom */}
      {notes && (
        <CaptionBar notes={notes} frame={frame} fps={fps} />
      )}
    </AbsoluteFill>
  );
};

// --- Terminal-style code block ---
const CodeTerminal: React.FC<{ code: string; frame: number; fps: number }> = ({
  code,
  frame,
  fps,
}) => {
  const enterSpring = spring({
    frame: Math.max(0, frame - 8),
    fps,
    config: { damping: 18, stiffness: 70 },
  });
  const scale = interpolate(enterSpring, [0, 1], [0.92, 1]);
  const opacity = interpolate(enterSpring, [0, 1], [0, 1]);

  // Typewriter
  const revealStart = 18;
  const charsRevealed = Math.floor(
    interpolate(frame, [revealStart, revealStart + code.length * 0.6], [0, code.length], {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    })
  );

  return (
    <div
      style={{
        width: "100%",
        borderRadius: 16,
        overflow: "hidden",
        backgroundColor: "#1c1c1c",
        border: "1px solid #2a2a2a",
        transform: `scale(${scale})`,
        opacity,
        boxShadow: "0 25px 50px rgba(0,0,0,0.4)",
      }}
    >
      {/* Chrome bar */}
      <div
        style={{
          padding: "12px 18px",
          display: "flex",
          alignItems: "center",
          gap: 8,
          backgroundColor: "#1c1c1c",
          borderBottom: "1px solid #2a2a2a",
        }}
      >
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#ff5f57" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#febc2e" }} />
        <div style={{ width: 12, height: 12, borderRadius: "50%", backgroundColor: "#28c840" }} />
      </div>

      {/* Code content */}
      <pre
        style={{
          padding: "24px 28px",
          margin: 0,
          minHeight: 200,
        }}
      >
        <code
          style={{
            fontSize: 18,
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            lineHeight: 1.7,
            color: "#d4d4d4",
            whiteSpace: "pre-wrap",
          }}
        >
          {code.slice(0, charsRevealed)}
          {charsRevealed < code.length && (
            <span style={{ color: "#ea580c" }}>▋</span>
          )}
        </code>
      </pre>
    </div>
  );
};

// --- Caption bar ---
const CaptionBar: React.FC<{ notes: string; frame: number; fps: number }> = ({
  notes,
  frame,
  fps,
}) => {
  const words = notes.split(" ");
  const wordsPerFrame = words.length / (fps * 10); // assume ~10s per slide
  
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 24,
        right: 24,
        borderRadius: "0 0 24px 24px",
        background: "linear-gradient(transparent, rgba(0,0,0,0.95) 40%)",
        padding: "48px 56px 28px",
      }}
    >
      <p
        style={{
          fontSize: 18,
          fontFamily: "'Inter', system-ui, sans-serif",
          fontWeight: 400,
          lineHeight: 1.6,
          textAlign: "center",
          margin: 0,
        }}
      >
        {words.map((word, i) => {
          const wordFrame = 10 + i / wordsPerFrame;
          const wordOpacity = interpolate(frame, [wordFrame, wordFrame + 3], [0.25, 0.9], {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          });
          return (
            <span key={i} style={{ color: `rgba(255,255,255,${wordOpacity})` }}>
              {word}{" "}
            </span>
          );
        })}
      </p>
    </div>
  );
};
