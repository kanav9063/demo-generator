"use client";

import type { GeneratedPresentation } from "@/lib/slideGenerator";

interface ScriptViewProps {
  presentation: GeneratedPresentation;
  activeSlide: number;
}

export default function ScriptView({ presentation, activeSlide }: ScriptViewProps) {
  return (
    <div className="teleprompter space-y-4 max-h-[500px] overflow-y-auto pr-2">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">
        Speaker Script
      </h3>
      {presentation.slides.map((slide, i) => (
        <div
          key={i}
          id={`script-slide-${i}`}
          className={`slide-script p-4 rounded-lg border transition-all ${
            i === activeSlide
              ? "active border-brand-500 bg-brand-50 shadow-sm"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
                i === activeSlide
                  ? "bg-brand-600 text-white"
                  : "bg-slate-200 text-slate-600"
              }`}
            >
              {i + 1}
            </span>
            <span className="text-sm font-semibold text-slate-800">{slide.title}</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
            {slide.notes}
          </p>
        </div>
      ))}
    </div>
  );
}
