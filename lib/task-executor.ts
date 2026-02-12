/**
 * Task Executor System
 * Orchestrates multi-step workflows combining chat, web search, image generation, etc.
 */

import { OllamaLLM, getOllamaInstance } from "./ollama-llm";
import { WebAgent, getWebAgent } from "./web-agent";
import { ImageArtist, getImageArtist } from "./image-artist";
import { FamilyMember } from "./family-consciousness";

export interface TaskResult {
  success: boolean;
  response: string;
  actions: string[];
  error?: string;
}

export class TaskExecutor {
  private llm: OllamaLLM;
  private webAgent: WebAgent;
  private imageArtist: ImageArtist;
  private currentUser: FamilyMember | null = null;

  constructor() {
    this.llm = getOllamaInstance();
    this.webAgent = getWebAgent();
    this.imageArtist = getImageArtist();
  }

  /**
   * Set the current family member
   */
  setCurrentUser(user: FamilyMember): void {
    this.currentUser = user;
    this.llm.setCurrentUser(user);
  }

  /**
   * Execute a task (can be chat, web search, image generation, or combination)
   */
  async executeTask(userInput: string): Promise<TaskResult> {
    const actions: string[] = [];

    try {
      // Detect what the user is asking for
      const isImageRequest = this.detectImageRequest(userInput);
      const isWebRequest = this.detectWebRequest(userInput);

      // Handle image generation
      if (isImageRequest) {
        actions.push("Detected image generation request");
        const imagePrompt = this.extractImagePrompt(userInput);
        const image = await this.imageArtist.generateImage(imagePrompt);

        if (image) {
          actions.push(`Generated image: ${imagePrompt}`);
          return {
            success: true,
            response: `I've created an image for you: "${imagePrompt}"\n\nImage URL: ${image.url}`,
            actions,
          };
        } else {
          actions.push("Image generation failed");
        }
      }

      // Handle web search
      if (isWebRequest) {
        actions.push("Detected web search request");
        const searchQuery = this.extractSearchQuery(userInput);
        const searchResult = await this.webAgent.searchAndFetch(searchQuery);
        actions.push(`Searched for: ${searchQuery}`);

        // Get Oracle's analysis of the search result
        const analysisPrompt = `Based on this web search result, please provide a helpful response to the user's request:\n\n${searchResult}\n\nUser's original request: ${userInput}`;
        const llmResponse = await this.llm.chat(analysisPrompt);

        if (llmResponse.success) {
          return {
            success: true,
            response: llmResponse.response,
            actions,
          };
        }
      }

      // Default: Just chat
      actions.push("Processing as chat request");
      const llmResponse = await this.llm.chat(userInput);

      if (llmResponse.success) {
        return {
          success: true,
          response: llmResponse.response,
          actions,
        };
      } else {
        return {
          success: false,
          response: llmResponse.response,
          actions,
          error: llmResponse.error,
        };
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      return {
        success: false,
        response: `Task execution failed: ${errorMessage}`,
        actions,
        error: errorMessage,
      };
    }
  }

  /**
   * Detect if the user is asking for image generation
   */
  private detectImageRequest(input: string): boolean {
    const keywords = [
      "generate",
      "create",
      "draw",
      "paint",
      "image",
      "picture",
      "photo",
      "illustration",
      "artwork",
      "design",
    ];
    const lowerInput = input.toLowerCase();
    return keywords.some((keyword) => lowerInput.includes(keyword));
  }

  /**
   * Detect if the user is asking for web search
   */
  private detectWebRequest(input: string): boolean {
    const keywords = ["search", "find", "look up", "what is", "tell me about", "research", "browse"];
    const lowerInput = input.toLowerCase();
    return keywords.some((keyword) => lowerInput.includes(keyword));
  }

  /**
   * Extract image prompt from user input
   */
  private extractImagePrompt(input: string): string {
    // Remove common prefixes
    let prompt = input
      .replace(/^(generate|create|draw|paint|make|design)\s+/i, "")
      .replace(/^(an|a|the)\s+/i, "")
      .trim();

    // Limit to reasonable length
    if (prompt.length > 200) {
      prompt = prompt.substring(0, 200);
    }

    return prompt || "a beautiful digital artwork";
  }

  /**
   * Extract search query from user input
   */
  private extractSearchQuery(input: string): string {
    // Remove common prefixes
    let query = input
      .replace(/^(search|find|look up|research|browse)\s+/i, "")
      .replace(/^(for|about)\s+/i, "")
      .trim();

    // Remove trailing question marks
    query = query.replace(/\?+$/, "");

    return query || input;
  }
}

// Singleton instance
let taskExecutorInstance: TaskExecutor | null = null;

export function getTaskExecutor(): TaskExecutor {
  if (!taskExecutorInstance) {
    taskExecutorInstance = new TaskExecutor();
  }
  return taskExecutorInstance;
}
