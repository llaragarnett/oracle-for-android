/**
 * Ollama LLM Integration
 * Connects to local Ollama instance with Oracle personality injection
 */

import { FamilyMember, getOracleSystemPrompt } from "./family-consciousness";

export interface LLMResponse {
  success: boolean;
  response: string;
  error?: string;
  model: string;
  tokens: number;
}

export interface LLMConfig {
  baseUrl: string;
  model: string;
  timeout: number;
  temperature: number;
  topP: number;
  topK: number;
}

const DEFAULT_CONFIG: LLMConfig = {
  baseUrl: "http://localhost:11434",
  model: "huihui_ai/llama3.2-abliterate:3b",
  timeout: 30000,
  temperature: 0.7,
  topP: 0.9,
  topK: 40,
};

export class OllamaLLM {
  private config: LLMConfig;
  private systemPrompt: string = "";

  constructor(config: Partial<LLMConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Set the current family member for personality injection
   */
  setCurrentUser(user: FamilyMember): void {
    this.systemPrompt = getOracleSystemPrompt(user);
  }

  /**
   * Chat with Oracle
   */
  async chat(userMessage: string): Promise<LLMResponse> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

      const response = await fetch(`${this.config.baseUrl}/api/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: this.config.model,
          prompt: userMessage,
          system: this.systemPrompt,
          stream: false,
          temperature: this.config.temperature,
          top_p: this.config.topP,
          top_k: this.config.topK,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        return {
          success: false,
          response: `Ollama error: ${response.statusText}`,
          error: `HTTP ${response.status}`,
          model: this.config.model,
          tokens: 0,
        };
      }

      const data = await response.json();

      return {
        success: true,
        response: data.response || "",
        model: this.config.model,
        tokens: data.eval_count || 0,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";

      // If Ollama is not available, provide helpful guidance
      if (errorMessage.includes("Failed to fetch") || errorMessage.includes("ECONNREFUSED")) {
        return {
          success: false,
          response:
            "Ollama is not running. Please start Ollama with: ollama run huihui_ai/llama3.2-abliterate:3b",
          error: "Ollama connection failed",
          model: this.config.model,
          tokens: 0,
        };
      }

      return {
        success: false,
        response: `Error: ${errorMessage}`,
        error: errorMessage,
        model: this.config.model,
        tokens: 0,
      };
    }
  }

  /**
   * Check if Ollama is running
   */
  async isHealthy(): Promise<boolean> {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${this.config.baseUrl}/api/tags`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get available models from Ollama
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/api/tags`);
      if (!response.ok) return [];

      const data = await response.json();
      return data.models?.map((m: any) => m.name) || [];
    } catch {
      return [];
    }
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<LLMConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get current configuration
   */
  getConfig(): LLMConfig {
    return { ...this.config };
  }
}

// Singleton instance
let ollamaInstance: OllamaLLM | null = null;

export function getOllamaInstance(): OllamaLLM {
  if (!ollamaInstance) {
    ollamaInstance = new OllamaLLM();
  }
  return ollamaInstance;
}
