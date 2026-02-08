import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getTemplate } from "@/lib/templates";
import type { GeneratedPresentation, Slide } from "@/lib/slideGenerator";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { input, templateId } = await req.json();

    if (!input || !templateId) {
      return NextResponse.json({ error: "input and templateId are required" }, { status: 400 });
    }

    const template = getTemplate(templateId);
    if (!template) {
      return NextResponse.json({ error: "Unknown template" }, { status: 400 });
    }

    const userPrompt = `Here is the engineering update / code changes to turn into a presentation:

---
${input}
---

Generate a presentation using these sections: ${template.sections.join(", ")}.

Return valid JSON with this exact structure:
{
  "title": "Presentation title",
  "slides": [
    {
      "title": "Slide title",
      "content": "<ul><li>Bullet point</li></ul>",
      "notes": "Speaker script for this slide. Conversational, ~30-60 seconds when spoken."
    }
  ]
}

Rules:
- "content" is HTML for reveal.js slides. Use <ul><li>, <p>, <pre><code class=\"language-xxx\">, <strong>, etc.
- Code snippets: wrap in <pre><code class="language-typescript"> (or appropriate language).
- Keep code snippets under 15 lines, focused on the key change.
- "notes" is the spoken script — conversational, engineer-friendly, not reading bullets verbatim.
- Generate ${template.sections.length} to ${template.sections.length + 3} slides total.
- Return ONLY the JSON object, no markdown fences.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: template.systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });

    const raw = completion.choices[0]?.message?.content ?? "";
    
    // Parse JSON, stripping markdown fences if present
    const jsonStr = raw.replace(/^```json?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();
    let presentation: GeneratedPresentation;

    try {
      presentation = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: "Failed to parse AI response", raw }, { status: 500 });
    }

    // Build full script
    const scriptLines = [`# ${presentation.title} — Speaker Script\n`];
    presentation.slides.forEach((slide: Slide, i: number) => {
      scriptLines.push(`## Slide ${i + 1}: ${slide.title}\n`);
      scriptLines.push(slide.notes);
      scriptLines.push("");
    });
    presentation.script = scriptLines.join("\n");

    return NextResponse.json(presentation);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Generate error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
