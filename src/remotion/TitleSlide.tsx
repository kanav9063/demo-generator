import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";

interface TitleSlideProps {
  title: string;
  subtitle?: string;
  durationInFrames: number;
}

export const TitleSlide: React.FC<TitleSlideProps> = ({
  title,
  subtitle,
  durationInFrames,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Gradient background animation
  const gradientShift = interpolate(frame, [0, durationInFrames], [0, 30], {
    extrapolateRight: "clamp",
  });

  // Title entrance with spring
  const titleSpring = spring({ frame, fps, config: { damping: 15, stiffness: 80 } });
  const titleY = interpolate(titleSpring, [0, 1], [60, 0]);
  const titleOpacity = interpolate(titleSpring, [0, 1], [0, 1]);

  // Subtitle entrance (delayed)
  const subtitleSpring = spring({ frame: Math.max(0, frame - 12), fps, config: { damping: 15, stiffness: 80 } });
  const subtitleOpacity = interpolate(subtitleSpring, [0, 1], [0, 1]);
  const subtitleY = interpolate(subtitleSpring, [0, 1], [30, 0]);

  // Accent line animation
  const lineWidth = interpolate(frame, [8, 28], [0, 200], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out
  const fadeOut = interpolate(
    frame,
    [durationInFrames - 15, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(${135 + gradientShift}deg, #0f172a 0%, #1e1b4b 40%, #312e81 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: fadeOut,
      }}
    >
      {/* Subtle grid pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "radial-gradient(circle at 1px 1px, rgba(99,102,241,0.08) 1px, transparent 0)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glowing orb */}
      <div
        style={{
          position: "absolute",
          width: 600,
          height: 600,
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)",
          filter: "blur(60px)",
          top: "20%",
          right: "15%",
        }}
      />

      <div style={{ textAlign: "center", zIndex: 1, padding: 80 }}>
        <h1
          style={{
            color: "#f8fafc",
            fontSize: 72,
            fontWeight: 800,
            fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
            margin: 0,
            lineHeight: 1.1,
            letterSpacing: "-0.02em",
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
          }}
        >
          {title}
        </h1>

        {/* Accent line */}
        <div
          style={{
            width: lineWidth,
            height: 4,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            borderRadius: 2,
            margin: "24px auto",
          }}
        />

        {subtitle && (
          <p
            style={{
              color: "#94a3b8",
              fontSize: 28,
              fontFamily: "'Inter', 'Segoe UI', system-ui, sans-serif",
              fontWeight: 400,
              margin: 0,
              opacity: subtitleOpacity,
              transform: `translateY(${subtitleY}px)`,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};
