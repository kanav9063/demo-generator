export interface Slide {
  title: string;
  content: string; // HTML content for the slide body
  notes: string;   // Speaker notes / script
}

export interface GeneratedPresentation {
  title: string;
  slides: Slide[];
  script: string; // Full markdown script
}

/**
 * Convert slides array into a reveal.js HTML document (inner slides only, no doctype).
 */
export function slidesToRevealHTML(presentation: GeneratedPresentation): string {
  const slidesSections = presentation.slides
    .map(
      (slide) => `
    <section>
      <h2>${escapeHtml(slide.title)}</h2>
      ${slide.content}
      <aside class="notes">${escapeHtml(slide.notes)}</aside>
    </section>`
    )
    .join("\n");

  return `<div class="slides">${slidesSections}\n</div>`;
}

/**
 * Generate a full standalone HTML file for export.
 */
export function slidesToStandaloneHTML(presentation: GeneratedPresentation): string {
  const slidesInner = presentation.slides
    .map(
      (slide) => `
        <section>
          <h2>${escapeHtml(slide.title)}</h2>
          ${slide.content}
          <aside class="notes">${escapeHtml(slide.notes)}</aside>
        </section>`
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(presentation.title)}</title>
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/theme/night.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.11.1/styles/github-dark.min.css" />
  <style>
    .reveal pre { width: 100%; box-shadow: none; }
    .reveal pre code { border-radius: 8px; padding: 1em; max-height: 500px; }
    .reveal h2 { font-size: 1.6em; margin-bottom: 0.5em; }
    .reveal ul { font-size: 0.85em; }
    .reveal li { margin-bottom: 0.4em; }
  </style>
</head>
<body>
  <div class="reveal">
    <div class="slides">
${slidesInner}
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/dist/reveal.js"><\/script>
  <script src="https://cdn.jsdelivr.net/npm/reveal.js@5.1.0/plugin/highlight/highlight.js"><\/script>
  <script>
    Reveal.initialize({
      hash: true,
      plugins: [RevealHighlight],
      transition: 'slide',
    });
  <\/script>
</body>
</html>`;
}

/**
 * Generate the full script as markdown.
 */
export function slidesToScriptMarkdown(presentation: GeneratedPresentation): string {
  const lines = [`# ${presentation.title} — Speaker Script\n`];
  presentation.slides.forEach((slide, i) => {
    lines.push(`## Slide ${i + 1}: ${slide.title}\n`);
    lines.push(slide.notes);
    lines.push("");
  });
  return lines.join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
