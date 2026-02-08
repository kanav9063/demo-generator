import { templates, getTemplate, Template } from "@/lib/templates";

describe("templates", () => {
  test("exports a non-empty array of templates", () => {
    expect(templates.length).toBeGreaterThan(0);
  });

  test("each template has required fields", () => {
    templates.forEach((t) => {
      expect(t.id).toBeTruthy();
      expect(t.name).toBeTruthy();
      expect(t.description).toBeTruthy();
      expect(t.systemPrompt).toBeTruthy();
      expect(Array.isArray(t.sections)).toBe(true);
      expect(t.sections.length).toBeGreaterThan(0);
    });
  });

  test("template IDs are unique", () => {
    const ids = templates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  test("contains known templates", () => {
    const ids = templates.map((t) => t.id);
    expect(ids).toContain("weekly-standup");
    expect(ids).toContain("sprint-review");
    expect(ids).toContain("tech-deep-dive");
    expect(ids).toContain("project-kickoff");
  });
});

describe("getTemplate", () => {
  test("returns template by valid ID", () => {
    const t = getTemplate("weekly-standup");
    expect(t).toBeDefined();
    expect(t!.id).toBe("weekly-standup");
    expect(t!.name).toBe("Weekly Standup");
  });

  test("returns undefined for unknown ID", () => {
    expect(getTemplate("nonexistent")).toBeUndefined();
  });

  test("returns undefined for empty string", () => {
    expect(getTemplate("")).toBeUndefined();
  });
});
