"use client";

import { useState } from "react";
import { templates } from "@/lib/templates";

interface InputFormProps {
  onGenerate: (input: string, templateId: string) => void;
  isLoading: boolean;
}

export default function InputForm({ onGenerate, isLoading }: InputFormProps) {
  const [input, setInput] = useState("");
  const [templateId, setTemplateId] = useState(templates[0].id);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onGenerate(input, templateId);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Template selector */}
      <div>
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          Presentation Template
        </label>
        <div className="grid grid-cols-2 gap-3">
          {templates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTemplateId(t.id)}
              className={`text-left p-3 rounded-lg border-2 transition-all ${
                templateId === t.id
                  ? "border-brand-500 bg-brand-50 shadow-sm"
                  : "border-slate-200 hover:border-slate-300 bg-white"
              }`}
            >
              <div className="font-medium text-sm text-slate-900">{t.name}</div>
              <div className="text-xs text-slate-500 mt-0.5">{t.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Input area */}
      <div>
        <label htmlFor="input" className="block text-sm font-semibold text-slate-700 mb-2">
          What did you build?
        </label>
        <textarea
          id="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={"Paste a git diff, commit messages, or describe what changed...\n\nExample:\n- Added user authentication with JWT tokens\n- Refactored the API layer to use middleware\n- Fixed N+1 query in dashboard endpoint"}
          rows={12}
          className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none font-mono resize-y"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isLoading || !input.trim()}
        className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        {isLoading ? (
          <>
            <div className="spinner !w-5 !h-5 !border-2 !border-white/30 !border-t-white" />
            Generating...
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Presentation
          </>
        )}
      </button>
    </form>
  );
}
