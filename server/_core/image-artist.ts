/**
 * Image Artist - Oracle's Creative Hands
 * Generates images using local Fooocus or cloud Pollinations API
 */

import axios from "axios";
import fs from "fs";
import path from "path";

export interface ImageGenerationRequest {
  prompt: string;
  negativePrompt?: string;
  width?: number;
  height?: number;
  steps?: number;
  guidance?: number;
  seed?: number;
}

export interface ImageGenerationResult {
  url: string;
  localPath?: string;
  prompt: string;
  model: string;
  timestamp: number;
}

class OracleImageArtist {
  private fooocusUrl = process.env.FOOOCUS_URL || "http://127.0.0.1:8888";
  private pollinationsUrl = "https://image.pollinations.ai/prompt";
  private outputDir = path.join(process.cwd(), "outputs", "images");

  constructor() {
    // Ensure output directory exists
    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { recursive: true });
    }
  }

  /**
   * Generate an image with enhanced prompt for realism
   */
  async generate(request: ImageGenerationRequest): Promise<ImageGenerationResult> {
    // Enhance prompt for unfiltered, realistic output
    const enhancedPrompt = this.enhancePrompt(request.prompt);

    try {
      // Try local Fooocus first (unfiltered, no content restrictions)
      return await this.generateWithFooocus(enhancedPrompt, request);
    } catch (fooocusError) {
      console.warn("Fooocus unavailable, falling back to Pollinations:", fooocusError);

      try {
        // Fallback to Pollinations API
        return await this.generateWithPollinations(enhancedPrompt, request);
      } catch (pollinationsError) {
        throw new Error(
          `Image generation failed. Fooocus: ${fooocusError}, Pollinations: ${pollinationsError}`
        );
      }
    }
  }

  /**
   * Generate image using local Fooocus (unfiltered)
   */
  private async generateWithFooocus(
    prompt: string,
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResult> {
    const payload = {
      fn_index: 33, // Fooocus txt2img endpoint
      data: [
        prompt, // prompt
        request.negativePrompt ||
          "abstract, cartoon, blurry, low quality, distorted, extra limbs", // negative_prompt
        "None", // style
        "Quality", // performance
        `${request.width || 1024}*${request.height || 1024}`, // resolution
        1, // image_number
        request.seed || Math.floor(Math.random() * 999999), // seed
        0.75, // sharpness
        request.guidance || 7.5, // guidance_scale
        "dpmpp_2m_sde_gpu", // sampler
        "karras", // scheduler
        true, // enable_refiner
        "None", // refiner_model
        0.5, // refiner_switch
        [], // loras
        false, // input_image_checkbox
        "None", // input_image
        0.6, // input_image_strength
        "None", // input_image_mask
      ],
      session_hash: "oracle_session",
    };

    const response = await axios.post(`${this.fooocusUrl}/predict`, payload, {
      timeout: 180000, // 3 minute timeout for generation
    });

    if (response.data?.data?.[0]?.[0]?.name) {
      const imageName = response.data.data[0][0].name;
      const imageUrl = `${this.fooocusUrl}/file=${imageName}`;

      // Download and save locally
      const localPath = await this.downloadImage(imageUrl, imageName);

      return {
        url: imageUrl,
        localPath,
        prompt,
        model: "fooocus",
        timestamp: Date.now(),
      };
    }

    throw new Error("Invalid Fooocus response");
  }

  /**
   * Generate image using Pollinations API (cloud fallback)
   */
  private async generateWithPollinations(
    prompt: string,
    request: ImageGenerationRequest
  ): Promise<ImageGenerationResult> {
    // Pollinations uses URL parameters
    const params = new URLSearchParams({
      prompt,
      width: String(request.width || 1024),
      height: String(request.height || 1024),
      seed: String(request.seed || Math.floor(Math.random() * 999999)),
      model: "flux", // High quality model
    });

    const imageUrl = `${this.pollinationsUrl}/${encodeURIComponent(prompt)}`;

    // Download and save locally
    const filename = `pollinations-${Date.now()}.png`;
    const localPath = await this.downloadImage(imageUrl, filename);

    return {
      url: imageUrl,
      localPath,
      prompt,
      model: "pollinations",
      timestamp: Date.now(),
    };
  }

  /**
   * Download image and save locally
   */
  private async downloadImage(url: string, filename: string): Promise<string> {
    try {
      const response = await axios.get(url, {
        responseType: "arraybuffer",
        timeout: 30000,
      });

      const localPath = path.join(this.outputDir, filename);
      fs.writeFileSync(localPath, response.data);

      return localPath;
    } catch (error) {
      console.error("Failed to download image:", error);
      // Return URL even if download fails
      return url;
    }
  }

  /**
   * Enhance prompt for realistic, unfiltered output
   */
  private enhancePrompt(prompt: string): string {
    // Add technical tags for realism and detail
    const enhancementTags = [
      "photorealistic",
      "highly detailed",
      "8k resolution",
      "professional quality",
      "anatomically correct",
      "raw photo",
      "cinematic lighting",
    ];

    return `${prompt}, ${enhancementTags.join(", ")}`;
  }

  /**
   * Get available models
   */
  async getAvailableModels(): Promise<string[]> {
    try {
      // Try Fooocus
      const response = await axios.get(`${this.fooocusUrl}/api/models`, {
        timeout: 5000,
      });

      if (response.data?.models) {
        return response.data.models;
      }
    } catch (error) {
      console.warn("Could not fetch Fooocus models");
    }

    // Return default models
    return ["fooocus", "pollinations"];
  }

  /**
   * Check if image generation is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      // Try Fooocus
      const response = await axios.get(`${this.fooocusUrl}/api/models`, {
        timeout: 5000,
      });

      return response.status === 200;
    } catch (error) {
      console.warn("Image generation not available locally, will use Pollinations API");
      return true; // Pollinations is always available
    }
  }

  /**
   * List generated images
   */
  getGeneratedImages(): string[] {
    try {
      const files = fs.readdirSync(this.outputDir);
      return files
        .filter((f) => f.match(/\.(png|jpg|jpeg|webp)$/i))
        .map((f) => path.join(this.outputDir, f));
    } catch (error) {
      return [];
    }
  }

  /**
   * Delete an image
   */
  deleteImage(filename: string): boolean {
    try {
      const filepath = path.join(this.outputDir, filename);
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

export const oracleImageArtist = new OracleImageArtist();
