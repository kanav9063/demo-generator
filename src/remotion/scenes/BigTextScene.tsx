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

interface BigTextSceneProps {
  heading: string;
  accentWord?: string;
  subtext?: string;
  audioUrl?: string;
  notes?: string;
}

/**
 * Full-screen bold text scene — like Thariq's "/rewind without losing context" style.
 * Big, bold, typographic. No bullets. Just a statement.
 */
export const BigTextScene: React.FC<BigTextSceneProps> = ({
  heading,
  accentWord,
  subtext,
  audioUrl,
  notes,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const words = heading.split(" ");

  return (
    <AbsoluteFill style={{ backgroundColor: "#0a0a0a" }}>
      {audioUrl && <Audio src={staticFile(audioUrl)} volume={1} />}

      {/* Inner device frame */}
      <div
        style={{
          position: "absolute",
          inset: 24,
          borderRadius: 24,
          backgroundColor: "#141414",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 80,
        }}
      >
        <div style={{ maxWidth: 1200, textAlign: "left" }}>
          {/* Line-by-line word entrance */}
          {words.map((word, i) => {
            const wordSpring = spring({
              frame: Math.max(0, frame - i * 5),
              fps,
              config: { damping: 16, stiffness: 70, mass: 0.7 },
            });
            const y = interpolate(wordSpring, [0, 1], [60, 0]);
            const opacity = interpolate(wordSpring, [0, 1], [0, 1]);
            const isAccent = accentWord && word.toLowerCase().includes(accentWord.toLowerCase());

            return (
              <div
                key={i}
                style={{
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    display: "inline-block",
                    fontSize: 100,
                    fontWeight: 800,
                    fontFamily: "'Inter', system-ui, sans-serif",
                    letterSpacing: "-0.03em",
                    lineHeight: 1.15,
                    color: isAccent ? "#ea580c" : "#fafafa",
                    transform: `translateY(${y}px)`,
                    opacity,
                  }}
                >
                  {word}
                </span>
              </div>
            );
          })}

          {subtext && (
            <p
              style={{
                fontSize: 28,
                fontWeight: 400,
                color: "#737373",
                fontFamily: "'Inter', system-ui, sans-serif",
                marginTop: 32,
                opacity: interpolate(
                  frame,
                  [words.length * 5 + 8, words.length * 5 + 20],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
                ),
              }}
            >
              {subtext}
            </p>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};
