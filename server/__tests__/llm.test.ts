import { describe, it, expect, vi, beforeEach } from "vitest";
import { invokeLLM } from "../_core/llm";

describe("LLM Integration", () => {
  beforeEach(() => {
    // Reset environment
    process.env.OLLAMA_URL = "http://localhost:11434";
    process.env.OLLAMA_MODEL = "dolphin-llama3";
  });

  it("should handle Ollama response correctly", async () => {
    // Mock fetch for Ollama
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            message: { content: "Test response from Ollama" },
            done: true,
            prompt_eval_count: 10,
            eval_count: 5,
          }),
      } as Response)
    );

    const result = await invokeLLM({
      messages: [
        { role: "system", content: "You are Oracle" },
        { role: "user", content: "Hello" },
      ],
    });

    expect(result.choices[0].message.content).toBe("Test response from Ollama");
    expect(result.model).toBe("dolphin-llama3");
    expect(result.usage?.prompt_tokens).toBe(10);
    expect(result.usage?.completion_tokens).toBe(5);
  });

  it("should normalize messages correctly", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            message: { content: "Response" },
            done: true,
          }),
      } as Response)
    );

    await invokeLLM({
      messages: [
        { role: "system", content: "System prompt" },
        { role: "user", content: "User message" },
        { role: "assistant", content: "Assistant message" },
      ],
    });

    expect(global.fetch).toHaveBeenCalled();
  });

  it("should include temperature in request", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            message: { content: "Response" },
            done: true,
          }),
      } as Response)
    );

    await invokeLLM({
      messages: [{ role: "user", content: "Test" }],
    });

    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.temperature).toBe(0.7);
  });

  it("should set stream to false", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            message: { content: "Response" },
            done: true,
          }),
      } as Response)
    );

    await invokeLLM({
      messages: [{ role: "user", content: "Test" }],
    });

    const callArgs = (global.fetch as any).mock.calls[0];
    const body = JSON.parse(callArgs[1].body);
    expect(body.stream).toBe(false);
  });

  it("should generate unique IDs for responses", async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () =>
          Promise.resolve({
            message: { content: "Response" },
            done: true,
          }),
      } as Response)
    );

    const result1 = await invokeLLM({
      messages: [{ role: "user", content: "Test 1" }],
    });

    await new Promise((resolve) => setTimeout(resolve, 2));

    const result2 = await invokeLLM({
      messages: [{ role: "user", content: "Test 2" }],
    });

    expect(result1.id).not.toBe(result2.id);
    expect(result1.id).toMatch(/^ollama-\d+$/);
  });
});
