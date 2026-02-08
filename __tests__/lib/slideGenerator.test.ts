import {
  slidesToRevealHTML,
  slidesToStandaloneHTML,
  slidesToScriptMarkdown,
  GeneratedPresentation,
} from "@/lib/slideGenerator";

const mockPresentation: GeneratedPresentation = {
  title: "Test Presentation",
  slides: [
    { title: "Intro", content: "<ul><li>Hello</li></ul>", notes: "Welcome everyone." },
    { title: "Details", content: "<p>Some details</p>", notes: "Let me explain." },
  ],
  script: "",
};

describe("slidesToRevealHTML", () => {
  test("wraps slides in a div.slides", () => {
    const html = slidesToRevealHTML(mockPresentation);
    expect(html).toContain('<div class="slides">');
    expect(html).toContain("</div>");
  });

  test("creates section per slide", () => {
    const html = slidesToRevealHTML(mockPresentation);
    const sectionCount = (html.match(/<section>/g) || []).length;
    expect(sectionCount).toBe(2);
  });

  test("includes slide titles as h2", () => {
    const html = slidesToRevealHTML(mockPresentation);
    expect(html).toContain("<h2>Intro</h2>");
    expect(html).toContain("<h2>Details</h2>");
  });

  test("includes slide content", () => {
    const html = slidesToRevealHTML(mockPresentation);
    expect(html).toContain("<ul><li>Hello</li></ul>");
  });

  test("includes speaker notes", () => {
    const html = slidesToRevealHTML(mockPresentation);
    expect(html).toContain('<aside class="notes">Welcome everyone.</aside>');
  });

  test("escapes HTML in titles and notes", () => {
    const pres: GeneratedPresentation = {
      title: "T",
      slides: [{ title: "<script>alert(1)</script>", content: "<p>ok</p>", notes: 'a "b" <c>' }],
      script: "",
    };
    const html = slidesToRevealHTML(pres);
    expect(html).toContain("&lt;script&gt;");
    expect(html).toContain("&quot;b&quot;");
    expect(html).not.toContain("<script>alert");
  });
});

describe("slidesToStandaloneHTML", () => {
  test("produces a full HTML document", () => {
    const html = slidesToStandaloneHTML(mockPresentation);
    expect(html).toContain("<!DOCTYPE html>");
    expect(html).toContain("<html");
    expect(html).toContain("</html>");
  });

  test("includes the presentation title", () => {
    const html = slidesToStandaloneHTML(mockPresentation);
    expect(html).toContain("<title>Test Presentation</title>");
  });

  test("includes reveal.js CDN links", () => {
    const html = slidesToStandaloneHTML(mockPresentation);
    expect(html).toContain("reveal.js");
    expect(html).toContain("Reveal.initialize");
  });

  test("includes all slides", () => {
    const html = slidesToStandaloneHTML(mockPresentation);
    expect(html).toContain("<h2>Intro</h2>");
    expect(html).toContain("<h2>Details</h2>");
  });
});

describe("slidesToScriptMarkdown", () => {
  test("starts with presentation title", () => {
    const md = slidesToScriptMarkdown(mockPresentation);
    expect(md).toContain("# Test Presentation — Speaker Script");
  });

  test("includes slide headings with numbers", () => {
    const md = slidesToScriptMarkdown(mockPresentation);
    expect(md).toContain("## Slide 1: Intro");
    expect(md).toContain("## Slide 2: Details");
  });

  test("includes speaker notes", () => {
    const md = slidesToScriptMarkdown(mockPresentation);
    expect(md).toContain("Welcome everyone.");
    expect(md).toContain("Let me explain.");
  });
});
