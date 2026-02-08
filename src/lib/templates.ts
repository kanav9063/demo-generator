export interface Template {
  id: string;
  name: string;
  description: string;
  systemPrompt: string;
  sections: string[];
}

export const templates: Template[] = [
  {
    id: "weekly-standup",
    name: "Weekly Standup",
    description: "Quick 5-minute update for daily/weekly standups",
    sections: ["Overview", "What Changed", "Demo", "Blockers", "Next Steps"],
    systemPrompt: `You are a presentation generator for engineering standups. Generate concise, punchy slides.
Keep each slide to 3-5 bullet points max. Total presentation should be ~5 minutes.
Tone: casual, direct, engineer-to-engineer. No fluff.
For code changes, highlight the WHY not just the WHAT.
Include relevant code snippets where they add clarity (keep them short, <15 lines).`,
  },
  {
    id: "sprint-review",
    name: "Sprint Review",
    description: "End-of-sprint demo for stakeholders and product team",
    sections: ["Sprint Goals", "What We Built", "Demo", "Key Decisions", "Metrics", "Next Sprint"],
    systemPrompt: `You are a presentation generator for sprint reviews. Generate clear slides suitable for mixed technical/non-technical audiences.
Balance technical detail with business impact. Each slide should have 3-6 bullet points.
Total presentation: ~15 minutes. Include before/after comparisons where relevant.
Tone: professional but approachable. Celebrate wins, be honest about challenges.
Include code snippets only for significant architectural changes.`,
  },
  {
    id: "tech-deep-dive",
    name: "Tech Deep-Dive",
    description: "Detailed technical walkthrough for engineering team",
    sections: ["Problem Statement", "Architecture", "Implementation", "Code Walkthrough", "Trade-offs", "Performance", "Next Steps"],
    systemPrompt: `You are a presentation generator for technical deep-dives. Generate detailed, thorough slides for senior engineers.
Include architecture decisions, trade-offs, and performance implications.
Code snippets should be substantial and well-annotated. Use mermaid diagrams for architecture.
Total presentation: ~30 minutes. Go deep on implementation details.
Tone: precise, technical, thorough. Assume audience knows the codebase.`,
  },
  {
    id: "project-kickoff",
    name: "Project Kickoff",
    description: "New project introduction and planning overview",
    sections: ["Vision", "Problem Space", "Proposed Architecture", "Milestones", "Open Questions", "Next Steps"],
    systemPrompt: `You are a presentation generator for project kickoffs. Generate motivating, clear slides that set context and direction.
Focus on the WHY before the HOW. Include rough architecture sketches (mermaid diagrams).
Total presentation: ~20 minutes. Balance vision with concrete next steps.
Tone: enthusiastic but grounded. Make the team excited to build this.`,
  },
];

export function getTemplate(id: string): Template | undefined {
  return templates.find((t) => t.id === id);
}
