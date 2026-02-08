"use client";

import { useState, useCallback } from "react";
import InputForm from "@/components/InputForm";
import SlidePreview from "@/components/SlidePreview";
import ScriptView from "@/components/ScriptView";
import ExportBar from "@/components/ExportBar";
import type { GeneratedPresentation } from "@/lib/slideGenerator";

export default function Home() {
  const [presentation, setPresentation] = useState<GeneratedPresentation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);

  const handleGenerate = async (input: string, templateId: string) => {
    setIsLoading(true);
    setError(null);
    setPresentation(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input, templateId }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Generation failed");
      }

      setPresentation(data);
      setActiveSlide(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSlideChange = useCallback((index: number) => {
    setActiveSlide(index);
    // Scroll script into view
    const el = document.getElementById(`script-slide-${index}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center gap-3">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2m0 2a2 2 0 012 2v1a2 2 0 01-2 2 2 2 0 01-2-2V6a2 2 0 012-2zm0 10v2m0-2a2 2 0 00-2-2H4a2 2 0 00-2 2v1a2 2 0 002 2h1a2 2 0 002-2zm10-10V2m0 2a2 2 0 012 2v1a2 2 0 01-2 2 2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Demo Generator</h1>
            <p className="text-xs text-slate-500">Turn code updates into polished presentations</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!presentation ? (
          /* Input phase */
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <InputForm onGenerate={handleGenerate} isLoading={isLoading} />
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Presentation phase */
          <div className="space-y-6">
            {/* Back button + title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setPresentation(null)}
                  className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  New Presentation
                </button>
                <h2 className="text-xl font-bold text-slate-900">{presentation.title}</h2>
              </div>
            </div>

            {/* Export bar */}
            <ExportBar presentation={presentation} />

            {/* Slides + Script side by side */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              <div className="lg:col-span-3">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                  <SlidePreview presentation={presentation} onSlideChange={handleSlideChange} />
                </div>
              </div>
              <div className="lg:col-span-2">
                <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
                  <ScriptView presentation={presentation} activeSlide={activeSlide} />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
