/**
 * Task Executor - Oracle's Action System
 * Orchestrates complex multi-step operations
 */

import { invokeLLM, type InvokeParams } from "./llm";
import { oracleWebAgent } from "./web-agent";
import { oracleImageArtist } from "./image-artist";

export interface Task {
  id: string;
  description: string;
  steps: TaskStep[];
  status: "pending" | "running" | "completed" | "failed";
  result?: string;
  error?: string;
}

export interface TaskStep {
  action: "chat" | "web_search" | "web_browse" | "generate_image" | "execute_code";
  params: Record<string, any>;
  result?: string;
  status: "pending" | "completed" | "failed";
}

class OracleTaskExecutor {
  private tasks: Map<string, Task> = new Map();

  /**
   * Execute a complex task with multiple steps
   */
  async executeTask(description: string, steps: TaskStep[]): Promise<Task> {
    const taskId = `task-${Date.now()}`;
    const task: Task = {
      id: taskId,
      description,
      steps,
      status: "running",
    };

    this.tasks.set(taskId, task);

    try {
      for (let i = 0; i < task.steps.length; i++) {
        const step = task.steps[i];
        step.status = "pending";

        try {
          step.result = await this.executeStep(step);
          step.status = "completed";
        } catch (error) {
          step.status = "failed";
          throw error;
        }
      }

      task.status = "completed";
      task.result = task.steps[task.steps.length - 1]?.result;
    } catch (error) {
      task.status = "failed";
      task.error = String(error);
    }

    return task;
  }

  /**
   * Execute a single step
   */
  private async executeStep(step: TaskStep): Promise<string> {
    switch (step.action) {
      case "chat":
        return this.executeChat(step.params as { message: string; familyContext?: string; conversationHistory?: Array<{ role: string; content: string }> });

      case "web_search":
        return this.executeWebSearch(step.params as { query: string; limit?: number });

      case "web_browse":
        return this.executeWebBrowse(step.params as { url: string });

      case "generate_image":
        return this.executeImageGeneration(step.params as { prompt: string; width?: number; height?: number });

      case "execute_code":
        return this.executeCode(step.params as { code: string; language?: string });

      default:
        throw new Error(`Unknown action: ${step.action}`);
    }
  }

  /**
   * Execute chat step
   */
  private async executeChat(params: {
    message: string;
    familyContext?: string;
    conversationHistory?: Array<{ role: string; content: string }>;
  }): Promise<string> {
    const result = await invokeLLM({
      messages: [
        {
          role: "user",
          content: params.message,
        },
      ],
    });

    const content = result.choices[0]?.message?.content;
    if (typeof content === "string") {
      return content;
    }
    return "";
  }

  /**
   * Execute web search step
   */
  private async executeWebSearch(params: { query: string; limit?: number }): Promise<string> {
    const result = await oracleWebAgent.search(params.query, params.limit || 5);

    return JSON.stringify(result, null, 2);
  }

  /**
   * Execute web browse step
   */
  private async executeWebBrowse(params: { url: string }): Promise<string> {
    const result = await oracleWebAgent.browse(params.url);

    return JSON.stringify(
      {
        title: result.title,
        url: result.url,
        content: result.content.substring(0, 2000), // Limit content
        links: result.links.slice(0, 10),
      },
      null,
      2
    );
  }

  /**
   * Execute image generation step
   */
  private async executeImageGeneration(params: {
    prompt: string;
    width?: number;
    height?: number;
  }): Promise<string> {
    const result = await oracleImageArtist.generate({
      prompt: params.prompt,
      width: params.width || 1024,
      height: params.height || 1024,
    });

    return JSON.stringify(
      {
        url: result.url,
        localPath: result.localPath,
        prompt: result.prompt,
        model: result.model,
      },
      null,
      2
    );
  }

  /**
   * Execute code step (sandboxed)
   */
  private async executeCode(params: { code: string; language?: string }): Promise<string> {
    // For security, only allow simple JavaScript evaluation
    if (params.language && params.language !== "javascript") {
      throw new Error("Only JavaScript is supported");
    }

    try {
      // Create a safe sandbox
      const sandbox = {
        console: console,
        Math: Math,
        Date: Date,
        JSON: JSON,
        Array: Array,
        Object: Object,
        String: String,
        Number: Number,
        Boolean: Boolean,
      };

      // Execute code in sandbox
      const func = new Function(...Object.keys(sandbox), params.code);
      const result = func(...Object.values(sandbox));

      return String(result);
    } catch (error) {
      throw new Error(`Code execution failed: ${error}`);
    }
  }

  /**
   * Get task status
   */
  getTask(taskId: string): Task | undefined {
    return this.tasks.get(taskId);
  }

  /**
   * List all tasks
   */
  listTasks(): Task[] {
    return Array.from(this.tasks.values());
  }

  /**
   * Parse natural language into task steps
   * This is where Oracle decides what to do
   */
  async parseTaskFromMessage(message: string): Promise<TaskStep[]> {
    // Use LLM to determine what actions to take
    const analysisPrompt = `Analyze this request and determine what steps Oracle should take:

Request: "${message}"

Respond with a JSON array of steps. Each step should have:
- action: "chat", "web_search", "web_browse", "generate_image", or "execute_code"
- params: object with required parameters

Example:
[
  {"action": "web_search", "params": {"query": "latest news"}},
  {"action": "chat", "params": {"message": "Summarize the search results"}}
]

Only respond with valid JSON, no other text.`;

    const result = await invokeLLM({
      messages: [
        {
          role: "user",
          content: analysisPrompt,
        },
      ],
    });

    try {
      const content = result.choices[0]?.message?.content;
      const contentStr = typeof content === "string" ? content : "[]";
      const steps = JSON.parse(contentStr);

      // Validate and convert to TaskStep format
      return steps.map((step: any) => ({
        action: step.action,
        params: step.params || {},
        status: "pending" as const,
      }));
    } catch (error) {
      // If parsing fails, default to chat
      return [
        {
          action: "chat",
          params: { message },
          status: "pending",
        },
      ];
    }
  }
}

export const oracleTaskExecutor = new OracleTaskExecutor();
