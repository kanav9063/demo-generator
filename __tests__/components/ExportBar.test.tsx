import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ExportBar from "@/components/ExportBar";
import type { GeneratedPresentation } from "@/lib/slideGenerator";

// Mock URL.createObjectURL / revokeObjectURL
global.URL.createObjectURL = jest.fn(() => "blob:mock");
global.URL.revokeObjectURL = jest.fn();

const mockPresentation: GeneratedPresentation = {
  title: "Test Pres",
  slides: [
    { title: "S1", content: "<p>c1</p>", notes: "Notes 1" },
    { title: "S2", content: "<p>c2</p>", notes: "Notes 2" },
  ],
  script: "",
};

describe("ExportBar", () => {
  test("renders export label", () => {
    render(<ExportBar presentation={mockPresentation} />);
    expect(screen.getByText("Export:")).toBeInTheDocument();
  });

  test("renders Slides HTML button", () => {
    render(<ExportBar presentation={mockPresentation} />);
    expect(screen.getByText("Slides (HTML)")).toBeInTheDocument();
  });

  test("renders Script MD button", () => {
    render(<ExportBar presentation={mockPresentation} />);
    expect(screen.getByText("Script (MD)")).toBeInTheDocument();
  });

  test("renders Narration MP3 button", () => {
    render(<ExportBar presentation={mockPresentation} />);
    expect(screen.getByText("Narration (MP3)")).toBeInTheDocument();
  });

  test("renders voice selector with options", () => {
    render(<ExportBar presentation={mockPresentation} />);
    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByText("Nova")).toBeInTheDocument();
    expect(screen.getByText("Alloy")).toBeInTheDocument();
  });

  test("clicking Slides HTML calls createObjectURL", () => {
    render(<ExportBar presentation={mockPresentation} />);
    fireEvent.click(screen.getByText("Slides (HTML)"));
    expect(global.URL.createObjectURL).toHaveBeenCalled();
    expect(global.URL.revokeObjectURL).toHaveBeenCalled();
  });
});
