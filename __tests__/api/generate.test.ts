/**
 * Tests for POST /api/generate route handler.
 * We mock OpenAI and next/server to test the logic.
 */

const mockCreate = jest.fn();
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    chat: { completions: { create: mockCreate } },
  }));
});

// Mock next/server
class MockNextRequest {
  private body: any;
  constructor(url: string, init: { method: string; body: string }) {
    this.body = JSON.parse(init.body);
  }
  async json() {
    return this.body;
  }
}

const mockJson = jest.fn().mockImplementation((data: any, init?: any) => ({
  data,
  status: init?.status || 200,
}));

const MockNextResponse = {
  json: mockJson,
};

jest.mock("next/server", () => ({
  NextRequest: MockNextRequest,
  NextResponse: MockNextResponse,
}));

// Import after mocks
import { POST } from "@/app/api/generate/route";

describe("POST /api/generate", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("returns 400 when input is missing", async () => {
    const req = new MockNextRequest("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({ templateId: "weekly-standup" }),
    });
    await POST(req as any);
    expect(mockJson).toHaveBeenCalledWith(
      { error: "input and templateId are required" },
      { status: 400 }
    );
  });

  test("returns 400 when templateId is missing", async () => {
    const req = new MockNextRequest("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({ input: "some changes" }),
    });
    await POST(req as any);
    expect(mockJson).toHaveBeenCalledWith(
      { error: "input and templateId are required" },
      { status: 400 }
    );
  });

  test("returns 400 for unknown template", async () => {
    const req = new MockNextRequest("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({ input: "changes", templateId: "nonexistent" }),
    });
    await POST(req as any);
    expect(mockJson).toHaveBeenCalledWith({ error: "Unknown template" }, { status: 400 });
  });

  test("returns presentation on success", async () => {
    const fakePresentation = {
      title: "My Presentation",
      slides: [
        { title: "Slide 1", content: "<p>Hello</p>", notes: "Speaker notes" },
      ],
    };
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: JSON.stringify(fakePresentation) } }],
    });

    const req = new MockNextRequest("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({ input: "Added auth", templateId: "weekly-standup" }),
    });
    await POST(req as any);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.model).toBe("gpt-4o");
    expect(callArgs.messages[0].role).toBe("system");

    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "My Presentation",
        slides: expect.any(Array),
        script: expect.stringContaining("Speaker notes"),
      })
    );
  });

  test("returns 500 when AI returns invalid JSON", async () => {
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "not valid json" } }],
    });

    const req = new MockNextRequest("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({ input: "changes", templateId: "weekly-standup" }),
    });
    await POST(req as any);
    expect(mockJson).toHaveBeenCalledWith(
      expect.objectContaining({ error: "Failed to parse AI response" }),
      { status: 500 }
    );
  });

  test("strips markdown fences from AI response", async () => {
    const fakePresentation = {
      title: "Fenced",
      slides: [{ title: "S1", content: "<p>ok</p>", notes: "notes" }],
    };
    mockCreate.mockResolvedValueOnce({
      choices: [{ message: { content: "```json\n" + JSON.stringify(fakePresentation) + "\n```" } }],
    });

    const req = new MockNextRequest("http://localhost/api/generate", {
      method: "POST",
      body: JSON.stringify({ input: "stuff", templateId: "sprint-review" }),
    });
    await POST(req as any);
    expect(mockJson).toHaveBeenCalledWith(expect.objectContaining({ title: "Fenced" }));
  });
});
