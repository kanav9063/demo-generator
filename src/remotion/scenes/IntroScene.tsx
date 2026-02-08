import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface IntroSceneProps {
  title: string;
  subtitle?: string;
}

export const IntroScene: React.FC<IntroSceneProps> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Split title into words for staggered animation
  const words = title.split(" ");

  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      {/* Subtle gradient accent */}
      <div
        style={{
          position: "absolute",
          width: 800,
          height: 800,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(234,88,12,0.08) 0%, transparent 70%)",
          filter: "blur(80px)",
          top: "10%",
          left: "30%",
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1, maxWidth: 1400 }}>
        {/* Title with word-by-word spring entrance */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "0 24px",
          }}
        >
          {words.map((word, i) => {
            const wordSpring = spring({
              frame: Math.max(0, frame - i * 4),
              fps,
              config: { damping: 14, stiffness: 80, mass: 0.8 },
            });
            const y = interpolate(wordSpring, [0, 1], [80, 0]);
            const opacity = interpolate(wordSpring, [0, 1], [0, 1]);

            return (
              <span
                key={i}
                style={{
                  fontSize: 96,
                  fontWeight: 800,
                  fontFamily: "'Inter', system-ui, sans-serif",
                  color: "#fafafa",
                  letterSpacing: "-0.03em",
                  lineHeight: 1.1,
                  transform: `translateY(${y}px)`,
                  opacity,
                }}
              >
                {word}
              </span>
            );
          })}
        </div>

        {/* Subtitle */}
        {subtitle && (
          <p
            style={{
              fontSize: 32,
              fontWeight: 400,
              color: "#737373",
              fontFamily: "'Inter', system-ui, sans-serif",
              marginTop: 32,
              opacity: interpolate(
                frame,
                [words.length * 4 + 10, words.length * 4 + 25],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
              ),
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};
