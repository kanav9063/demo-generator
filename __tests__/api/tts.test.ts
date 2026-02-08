const mockSpeechCreate = jest.fn();
jest.mock("openai", () => {
  return jest.fn().mockImplementation(() => ({
    audio: { speech: { create: mockSpeechCreate } },
  }));
});

// We need to mock NextResponse constructor and json
const mockJsonFn = jest.fn().mockImplementation((data: any, init?: any) => ({
  data,
  status: init?.status || 200,
}));

let lastNextResponseArgs: any[] = [];
const MockNextResponseClass = jest.fn().mockImplementation((...args: any[]) => {
  lastNextResponseArgs = args;
  return { body: args[0], headers: args[1]?.headers };
});
(MockNextResponseClass as any).json = mockJsonFn;

jest.mock("next/server", () => ({
  NextRequest: jest.fn(),
  NextResponse: MockNextResponseClass,
}));

import { POST } from "@/app/api/tts/route";

function makeReq(body: any) {
  return { json: async () => body } as any;
}

describe("POST /api/tts", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    lastNextResponseArgs = [];
  });

  test("returns 400 when text is missing", async () => {
    await POST(makeReq({}));
    expect(mockJsonFn).toHaveBeenCalledWith({ error: "text is required" }, { status: 400 });
  });

  test("calls OpenAI TTS with correct params", async () => {
    const fakeBuffer = new ArrayBuffer(8);
    mockSpeechCreate.mockResolvedValueOnce({ arrayBuffer: async () => fakeBuffer });

    await POST(makeReq({ text: "Hello world", voice: "echo" }));

    expect(mockSpeechCreate).toHaveBeenCalledWith({
      model: "tts-1",
      voice: "echo",
      input: "Hello world",
    });
    expect(MockNextResponseClass).toHaveBeenCalled();
  });

  test("defaults voice to nova", async () => {
    const fakeBuffer = new ArrayBuffer(8);
    mockSpeechCreate.mockResolvedValueOnce({ arrayBuffer: async () => fakeBuffer });

    await POST(makeReq({ text: "Hello" }));

    expect(mockSpeechCreate).toHaveBeenCalledWith(
      expect.objectContaining({ voice: "nova" })
    );
  });

  test("returns 500 on OpenAI error", async () => {
    mockSpeechCreate.mockRejectedValueOnce(new Error("API down"));

    await POST(makeReq({ text: "Hello" }));
    expect(mockJsonFn).toHaveBeenCalledWith({ error: "API down" }, { status: 500 });
  });
});
