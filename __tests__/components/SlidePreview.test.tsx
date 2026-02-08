import React from "react";
import { render, screen } from "@testing-library/react";
import SlidePreview from "@/components/SlidePreview";
import type { GeneratedPresentation } from "@/lib/slideGenerator";

// Mock reveal.js since it needs DOM APIs not available in jsdom
jest.mock("reveal.js", () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      initialize: jest.fn().mockResolvedValue(undefined),
      on: jest.fn(),
      destroy: jest.fn(),
      slide: jest.fn(),
    })),
  };
});

jest.mock("reveal.js/plugin/highlight/highlight.esm.js", () => ({
  __esModule: true,
  default: jest.fn(),
}));

const mockPresentation: GeneratedPresentation = {
  title: "Test",
  slides: [
    { title: "Slide A", content: "<p>Content A</p>", notes: "Notes A" },
    { title: "Slide B", content: "<p>Content B</p>", notes: "Notes B" },
  ],
  script: "",
};

describe("SlidePreview", () => {
  test("renders slide navigation buttons", () => {
    render(<SlidePreview presentation={mockPresentation} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
  });

  test("shows slide count info", () => {
    render(<SlidePreview presentation={mockPresentation} />);
    expect(screen.getByText(/slide 1 of 2/i)).toBeInTheDocument();
  });

  test("renders fullscreen button", () => {
    render(<SlidePreview presentation={mockPresentation} />);
    expect(screen.getByText("Fullscreen")).toBeInTheDocument();
  });

  test("renders the reveal container", () => {
    const { container } = render(<SlidePreview presentation={mockPresentation} />);
    expect(container.querySelector(".reveal-container")).toBeInTheDocument();
  });
});
