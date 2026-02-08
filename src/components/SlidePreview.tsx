"use client";

import { useEffect, useRef, useState } from "react";
import type { GeneratedPresentation } from "@/lib/slideGenerator";

interface SlidePreviewProps {
  presentation: GeneratedPresentation;
  onSlideChange?: (index: number) => void;
}

export default function SlidePreview({ presentation, onSlideChange }: SlidePreviewProps) {
  const deckRef = useRef<HTMLDivElement>(null);
  const revealRef = useRef<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    let revealInstance: any = null;

    const init = async () => {
      const Reveal = (await import("reveal.js")).default;
      const Highlight = (await import("reveal.js/plugin/highlight/highlight.esm.js")).default;

      if (!deckRef.current) return;

      // Build slides HTML
      const slidesDiv = deckRef.current.querySelector(".slides");
      if (!slidesDiv) return;

      slidesDiv.innerHTML = presentation.slides
        .map(
          (slide) => `
          <section>
            <h2 style="font-size:1.4em;margin-bottom:0.5em;text-align:left;">${escapeHtml(slide.title)}</h2>
            <div style="text-align:left;font-size:0.75em;">${slide.content}</div>
            <aside class="notes">${escapeHtml(slide.notes)}</aside>
          </section>`
        )
        .join("\n");

      revealInstance = new Reveal(deckRef.current, {
        hash: false,
        embedded: true,
        transition: "slide",
        plugins: [Highlight],
        width: 960,
        height: 540,
        margin: 0.05,
        controls: true,
        progress: true,
        controlsTutorial: false,
      });

      await revealInstance.initialize();

      revealInstance.on("slidechanged", (event: { indexh: number }) => {
        setCurrentSlide(event.indexh);
        onSlideChange?.(event.indexh);
      });

      revealRef.current = revealInstance;
    };

    init();

    return () => {
      if (revealInstance && typeof revealInstance.destroy === "function") {
        try { revealInstance.destroy(); } catch {}
      }
    };
  }, [presentation, onSlideChange]);

  const goToSlide = (index: number) => {
    if (revealRef.current && typeof (revealRef.current as any).slide === "function") {
      (revealRef.current as any).slide(index);
    }
  };

  const toggleFullscreen = () => {
    if (!deckRef.current) return;
    if (!document.fullscreenElement) {
      deckRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Controls bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          {presentation.slides.map((_, i) => (
            <button
              key={i}
              onClick={() => goToSlide(i)}
              className={`w-8 h-8 rounded text-xs font-medium transition-colors ${
                i === currentSlide
                  ? "bg-brand-600 text-white"
                  : "bg-slate-200 text-slate-600 hover:bg-slate-300"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <button
          onClick={toggleFullscreen}
          className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
          </svg>
          {isFullscreen ? "Exit" : "Fullscreen"}
        </button>
      </div>

      {/* Reveal.js deck */}
      <div
        ref={deckRef}
        className="reveal-container border border-slate-200 rounded-lg overflow-hidden bg-slate-900"
        style={{ height: "420px" }}
      >
        <div className="reveal">
          <div className="slides">
            <section><h2>Loading...</h2></section>
          </div>
        </div>
      </div>

      {/* Current slide info */}
      <div className="text-sm text-slate-500 text-center">
        Slide {currentSlide + 1} of {presentation.slides.length} — Use arrow keys or click to navigate
      </div>
    </div>
  );
}

function escapeHtml(str: string): string {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
