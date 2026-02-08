import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import InputForm from "@/components/InputForm";
import { templates } from "@/lib/templates";

describe("InputForm", () => {
  const mockOnGenerate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("renders all template options", () => {
    render(<InputForm onGenerate={mockOnGenerate} isLoading={false} />);
    templates.forEach((t) => {
      expect(screen.getByText(t.name)).toBeInTheDocument();
    });
  });

  test("renders textarea with placeholder", () => {
    render(<InputForm onGenerate={mockOnGenerate} isLoading={false} />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toBeInTheDocument();
  });

  test("submit button is disabled when input is empty", () => {
    render(<InputForm onGenerate={mockOnGenerate} isLoading={false} />);
    const btn = screen.getByRole("button", { name: /generate presentation/i });
    expect(btn).toBeDisabled();
  });

  test("submit button is disabled when loading", () => {
    render(<InputForm onGenerate={mockOnGenerate} isLoading={true} />);
    expect(screen.getByText(/generating/i)).toBeInTheDocument();
  });

  test("calls onGenerate with input and default template on submit", () => {
    render(<InputForm onGenerate={mockOnGenerate} isLoading={false} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Added new feature" } });

    const form = textarea.closest("form")!;
    fireEvent.submit(form);

    expect(mockOnGenerate).toHaveBeenCalledWith("Added new feature", templates[0].id);
  });

  test("allows selecting a different template", () => {
    render(<InputForm onGenerate={mockOnGenerate} isLoading={false} />);

    // Click on sprint-review template
    fireEvent.click(screen.getByText("Sprint Review"));

    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "Sprint work" } });
    fireEvent.submit(textarea.closest("form")!);

    expect(mockOnGenerate).toHaveBeenCalledWith("Sprint work", "sprint-review");
  });

  test("does not call onGenerate when input is only whitespace", () => {
    render(<InputForm onGenerate={mockOnGenerate} isLoading={false} />);
    const textarea = screen.getByRole("textbox");
    fireEvent.change(textarea, { target: { value: "   " } });
    fireEvent.submit(textarea.closest("form")!);
    expect(mockOnGenerate).not.toHaveBeenCalled();
  });
});
