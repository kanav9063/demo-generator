import React from "react";
import { render, screen } from "@testing-library/react";
import ScriptView from "@/components/ScriptView";
import type { GeneratedPresentation } from "@/lib/slideGenerator";

const mockPresentation: GeneratedPresentation = {
  title: "Test",
  slides: [
    { title: "Intro", content: "<p>x</p>", notes: "Welcome to the demo." },
    { title: "Details", content: "<p>y</p>", notes: "Here are the details." },
    { title: "Wrap Up", content: "<p>z</p>", notes: "Thanks for watching." },
  ],
  script: "",
};

describe("ScriptView", () => {
  test("renders Speaker Script heading", () => {
    render(<ScriptView presentation={mockPresentation} activeSlide={0} />);
    expect(screen.getByText("Speaker Script")).toBeInTheDocument();
  });

  test("renders all slide titles", () => {
    render(<ScriptView presentation={mockPresentation} activeSlide={0} />);
    expect(screen.getByText("Intro")).toBeInTheDocument();
    expect(screen.getByText("Details")).toBeInTheDocument();
    expect(screen.getByText("Wrap Up")).toBeInTheDocument();
  });

  test("renders all speaker notes", () => {
    render(<ScriptView presentation={mockPresentation} activeSlide={0} />);
    expect(screen.getByText("Welcome to the demo.")).toBeInTheDocument();
    expect(screen.getByText("Here are the details.")).toBeInTheDocument();
    expect(screen.getByText("Thanks for watching.")).toBeInTheDocument();
  });

  test("renders slide numbers", () => {
    render(<ScriptView presentation={mockPresentation} activeSlide={0} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  test("highlights the active slide", () => {
    const { container } = render(<ScriptView presentation={mockPresentation} activeSlide={1} />);
    const activeEl = container.querySelector("#script-slide-1");
    expect(activeEl).toHaveClass("active");
    const inactiveEl = container.querySelector("#script-slide-0");
    expect(inactiveEl).not.toHaveClass("active");
  });
});
