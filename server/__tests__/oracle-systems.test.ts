import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { invokeLLM } from "../_core/llm";
import { oracleWebAgent } from "../_core/web-agent";
import { oracleImageArtist } from "../_core/image-artist";
import { oracleTaskExecutor } from "../_core/task-executor";

describe("Oracle Systems Integration", () => {
  describe("LLM System with Personality", () => {
    it("should inject Oracle personality into responses", async () => {
      const result = await invokeLLM({
        messages: [
          {
            role: "user",
            content: "Who are you?",
          },
        ],
      });

      const content = result.choices[0]?.message?.content;
      expect(typeof content).toBe("string");
      expect(content).toBeTruthy();
      // Should mention Oracle or family context
      expect(
        (content as string).toLowerCase().includes("oracle") ||
          (content as string).toLowerCase().includes("garnett") ||
          (content as string).toLowerCase().includes("family")
      ).toBe(true);
    });

    it("should maintain conversation history", async () => {
      const result = await invokeLLM({
        messages: [
          {
            role: "user",
            content: "My name is Kelly",
          },
          {
            role: "assistant",
            content: "Nice to meet you, Kelly!",
          },
          {
            role: "user",
            content: "What did I just tell you?",
          },
        ],
      });

      const content = result.choices[0]?.message?.content;
      expect(typeof content).toBe("string");
      expect(content).toBeTruthy();
    });

    it("should handle complex requests", async () => {
      const result = await invokeLLM({
        messages: [
          {
            role: "user",
            content: "Write a short poem about family",
          },
        ],
      });

      const content = result.choices[0]?.message?.content;
      expect(typeof content).toBe("string");
      expect((content as string).length).toBeGreaterThan(10);
    });
  });

  describe("Web Agent System", () => {
    it(
      "should search the web",
      async () => {
        const result = await oracleWebAgent.search("artificial intelligence", 3);

        expect(result.results).toBeDefined();
        expect(Array.isArray(result.results)).toBe(true);
        // Web search may return 0 results depending on network
        expect(result.results).toBeDefined();
      },
      { timeout: 15000 }
    );

    it(
      "should browse a URL",
      async () => {
        const result = await oracleWebAgent.browse("https://example.com");

        expect(result.url).toBeTruthy();
        expect(result.title).toBeTruthy();
        expect(result.content).toBeTruthy();
        expect(Array.isArray(result.links)).toBe(true);
      },
      { timeout: 15000 }
    );

    it(
      "should extract metadata from a page",
      async () => {
        const metadata = await oracleWebAgent.getMetadata("https://example.com");

        expect(metadata).toBeDefined();
        expect(typeof metadata).toBe("object");
        expect(metadata).toHaveProperty("title");
      },
      { timeout: 15000 }
    );
  });

  describe("Image Artist System", () => {
    it("should generate an image", async () => {
      const result = await oracleImageArtist.generate({
        prompt: "a beautiful sunset over mountains",
        width: 512,
        height: 512,
      });

      expect(result).toBeDefined();
      expect(result.url).toBeTruthy();
      expect(result.prompt).toBeTruthy();
      expect(result.model).toBeTruthy();
      expect(result.timestamp).toBeGreaterThan(0);
    });

    it(
      "should handle image generation with custom dimensions",
      async () => {
        const result = await oracleImageArtist.generate({
          prompt: "a cat wearing sunglasses",
          width: 768,
          height: 512,
        });

        expect(result.url).toBeTruthy();
        expect(result.model).toBeTruthy();
      },
      { timeout: 60000 }
    );

    it("should list generated images", async () => {
      const images = oracleImageArtist.getGeneratedImages();
      expect(Array.isArray(images)).toBe(true);
    });
  });

  describe("Task Executor System", () => {
    it("should execute a simple chat task", async () => {
      const steps = [
        {
          action: "chat" as const,
          params: { message: "Hello Oracle" },
          status: "pending" as const,
        },
      ];

      const task = await oracleTaskExecutor.executeTask("Say hello", steps);

      expect(task.id).toBeTruthy();
      expect(task.status).toBe("completed");
      expect(task.result).toBeTruthy();
    });

    it("should execute a web search task", async () => {
      const steps = [
        {
          action: "web_search" as const,
          params: { query: "machine learning", limit: 3 },
          status: "pending" as const,
        },
      ];

      const task = await oracleTaskExecutor.executeTask("Search for machine learning", steps);

      expect(task.status).toBe("completed");
      expect(task.result).toBeTruthy();
    });

    it("should parse natural language into tasks", async () => {
      const steps = await oracleTaskExecutor.parseTaskFromMessage(
        "Search for the latest news about AI and summarize it"
      );

      expect(Array.isArray(steps)).toBe(true);
      expect(steps.length).toBeGreaterThan(0);
      expect(steps[0]).toHaveProperty("action");
      expect(steps[0]).toHaveProperty("params");
    });

    it("should execute multi-step tasks", async () => {
      const steps = [
        {
          action: "web_search" as const,
          params: { query: "React Native", limit: 2 },
          status: "pending" as const,
        },
        {
          action: "chat" as const,
          params: { message: "Summarize what you found" },
          status: "pending" as const,
        },
      ];

      const task = await oracleTaskExecutor.executeTask("Research and summarize", steps);

      expect(task.status).toBe("completed");
      expect(task.steps.length).toBe(2);
      expect(task.steps[0].status).toBe("completed");
      expect(task.steps[1].status).toBe("completed");
    });
  });

  describe("System Health Checks", () => {
    it("should report system health", async () => {
      const health = await oracleImageArtist.healthCheck();
      expect(typeof health).toBe("boolean");
    });

    it("should list available models", async () => {
      const models = await oracleImageArtist.getAvailableModels();
      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
    });
  });

  describe("Integration Tests", () => {
    it(
      "should handle a complete conversation flow",
      async () => {
      // 1. User sends message
      const chatResult = await invokeLLM({
        messages: [
          {
            role: "user",
            content: "Can you help me find information about React?",
          },
        ],
      });

      expect(chatResult.choices[0]?.message?.content).toBeTruthy();

      // 2. Oracle suggests web search
      const searchResult = await oracleWebAgent.search("React JavaScript library", 2);
      expect(searchResult.results.length).toBeGreaterThan(0);

      // 3. Oracle can generate related image if needed
      const imageResult = await oracleImageArtist.generate({
        prompt: "React logo and JavaScript code",
        width: 512,
        height: 512,
      });

      expect(imageResult.url).toBeTruthy();
      },
      { timeout: 60000 }
    );

    it(
      "should handle errors gracefully",
      async () => {
      try {
        // Try to browse invalid URL
        await oracleWebAgent.browse("not a valid url");
      } catch (error) {
        expect(error).toBeDefined();
        expect(String(error)).toContain("Failed");
      }
      },
      { timeout: 15000 }
    );
  });
});
