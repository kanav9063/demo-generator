import React from "react";
import {
  TransitionSeries,
  springTiming,
  linearTiming,
} from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { IntroScene } from "./scenes/IntroScene";
import { SplitScene } from "./scenes/SplitScene";
import { BigTextScene } from "./scenes/BigTextScene";
import type { VideoCompositionProps, SlideData } from "./types";

// Parse HTML content helpers
function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'").trim();
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

function extractCode(html: string): string | undefined {
  const codeRegex = /<code[^>]*>([\s\S]*?)<\/code>/i;
  const match = codeRegex.exec(html);
  return match ? stripHtml(match[1]) : undefined;
}

// Pick an accent word from the heading
function pickAccentWord(title: string): string | undefined {
  const words = title.split(" ");
  // Pick the most "important" looking word — longest word or a technical term
  const techWords = words.filter(w => /[A-Z]/.test(w) && w.length > 3);
  if (techWords.length > 0) return techWords[0];
  const sorted = [...words].sort((a, b) => b.length - a.length);
  return sorted[0]?.length > 4 ? sorted[0] : undefined;
}

export const DemoVideo: React.FC<VideoCompositionProps> = ({
  slides,
  fps,
  presentationTitle,
}) => {
  const totalSlides = slides.length;
  const transitionDuration = Math.ceil(fps * 0.5); // 0.5s transitions

  const sequences: React.ReactNode[] = [];

  // --- INTRO ---
  if (presentationTitle) {
    const introDuration = Math.ceil(fps * 3.5);
    sequences.push(
      <TransitionSeries.Sequence
        key="intro"
        durationInFrames={introDuration}
      >
        <IntroScene title={presentationTitle} />
      </TransitionSeries.Sequence>
    );
    sequences.push(
      <TransitionSeries.Transition
        key="intro-transition"
        timing={linearTiming({ durationInFrames: transitionDuration })}
        presentation={fade()}
      />
    );
  }

  // --- CONTENT SLIDES ---
  slides.forEach((slideData, i) => {
    const duration = slideData.audioDurationInFrames || Math.ceil(fps * 8);
    const bullets = extractBullets(slideData.content);
    const code = extractCode(slideData.content);
    const accent = pickAccentWord(slideData.title);
    const isLastSlide = i === slides.length - 1;

    // Use BigTextScene for intro/outro type slides (short content, no code)
    const isBigText = bullets.length <= 1 && !code && slideData.title.length < 40;

    sequences.push(
      <TransitionSeries.Sequence
        key={`slide-${i}`}
        durationInFrames={duration}
      >
        {isBigText ? (
          <BigTextScene
            heading={slideData.title}
            accentWord={accent}
            subtext={bullets[0] || stripHtml(slideData.content)}
            audioUrl={slideData.audioUrl}
            notes={slideData.notes}
          />
        ) : (
          <SplitScene
            heading={slideData.title}
            accentWord={accent}
            bullets={bullets}
            codeBlock={code}
            audioUrl={slideData.audioUrl}
            notes={slideData.notes}
            slideIndex={i}
            totalSlides={totalSlides}
          />
        )}
      </TransitionSeries.Sequence>
    );

    // Add transition (except after last)
    if (!isLastSlide) {
      sequences.push(
        <TransitionSeries.Transition
          key={`transition-${i}`}
          timing={springTiming({
            config: { damping: 200 },
            durationInFrames: transitionDuration,
          })}
          presentation={i % 2 === 0 ? fade() : slide({ direction: "from-right" })}
        />
      );
    }
  });

  return <TransitionSeries>{sequences}</TransitionSeries>;
};
