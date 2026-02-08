"use client";

import { useState } from "react";
import type { GeneratedPresentation } from "@/lib/slideGenerator";
import { slidesToStandaloneHTML, slidesToScriptMarkdown } from "@/lib/slideGenerator";

interface ExportBarProps {
  presentation: GeneratedPresentation;
}

export default function ExportBar({ presentation }: ExportBarProps) {
  const [ttsLoading, setTtsLoading] = useState(false);
  const [ttsVoice, setTtsVoice] = useState("nova");

  const downloadFile = (content: string, filename: string, mime: string) => {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const exportSlides = () => {
    const html = slidesToStandaloneHTML(presentation);
    downloadFile(html, "presentation.html", "text/html");
  };

  const exportScript = () => {
    const md = slidesToScriptMarkdown(presentation);
    downloadFile(md, "script.md", "text/markdown");
  };

  const exportTTS = async () => {
    setTtsLoading(true);
    try {
      const fullScript = presentation.slides.map((s) => s.notes).join("\n\n");
      const res = await fetch("/api/tts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: fullScript, voice: ttsVoice }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "TTS failed");
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "narration.mp3";
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert(`TTS Error: ${err instanceof Error ? err.message : "Unknown error"}`);
    } finally {
      setTtsLoading(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-white border border-slate-200 rounded-lg">
      <span className="text-sm font-semibold text-slate-700">Export:</span>

      <button
        onClick={exportSlides}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
        Slides (HTML)
      </button>

      <button
        onClick={exportScript}
        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
        Script (MD)
      </button>

      <div className="flex items-center gap-2">
        <select
          value={ttsVoice}
          onChange={(e) => setTtsVoice(e.target.value)}
          className="text-sm border border-slate-300 rounded-md px-2 py-1.5 bg-white"
        >
          <option value="nova">Nova</option>
          <option value="alloy">Alloy</option>
          <option value="echo">Echo</option>
          <option value="fable">Fable</option>
          <option value="onyx">Onyx</option>
          <option value="shimmer">Shimmer</option>
        </select>
        <button
          onClick={exportTTS}
          disabled={ttsLoading}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 text-white rounded-md transition-colors"
        >
          {ttsLoading ? (
            <div className="spinner !w-4 !h-4 !border-2 !border-white/30 !border-t-white" />
          ) : (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )}
          Narration (MP3)
        </button>
      </div>
    </div>
  );
}
