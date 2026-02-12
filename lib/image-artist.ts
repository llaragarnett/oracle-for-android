/**
 * Image Generation System
 * Generates images using Fooocus (local) or Pollinations (cloud fallback)
 */

export interface GeneratedImage {
  url: string;
  prompt: string;
  seed: number;
  timestamp: Date;
}

export class ImageArtist {
  private fooocusUrl = "http://127.0.0.1:8888";
  private pollinationsUrl = "https://image.pollinations.ai";

  /**
   * Generate an image from a text prompt
   */
  async generateImage(prompt: string): Promise<GeneratedImage | null> {
    // Try local Fooocus first
    const fooocusResult = await this.tryFooocus(prompt);
    if (fooocusResult) {
      return fooocusResult;
    }

    // Fallback to Pollinations
    const pollinationsResult = await this.tryPollinations(prompt);
    if (pollinationsResult) {
      return pollinationsResult;
    }

    return null;
  }

  /**
   * Try to generate using local Fooocus
   */
  private async tryFooocus(prompt: string): Promise<GeneratedImage | null> {
    try {
      // Enhance prompt for better results
      const enhancedPrompt = `${prompt}, photorealistic, highly detailed, anatomically correct, 8k, raw photo`;

      const payload = {
        fn_index: 33,
        data: [
          enhancedPrompt,
          "abstract, cartoon, blurry, low quality, distorted anatomy, extra limbs",
          "None",
          "Quality",
          "1024*1024",
          1,
          Math.floor(Math.random() * 999999),
          0.75,
          2,
          "dpmpp_2m_sde_gpu",
          "karras",
          true,
          "None",
          0.5,
          [],
          true,
          "None",
          0.6,
          "None",
        ],
        session_hash: "oracle_session",
      };

      const response = await fetch(`${this.fooocusUrl}/predict`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        timeout: 60000,
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();

      if (data.data && data.data[0] && data.data[0][0]) {
        const imageName = data.data[0][0].name;
        const imageUrl = `${this.fooocusUrl}/file=${imageName}`;

        return {
          url: imageUrl,
          prompt,
          seed: Math.floor(Math.random() * 999999),
          timestamp: new Date(),
        };
      }

      return null;
    } catch (error) {
      console.error("Fooocus generation failed:", error);
      return null;
    }
  }

  /**
   * Try to generate using Pollinations API
   */
  private async tryPollinations(prompt: string): Promise<GeneratedImage | null> {
    try {
      const seed = Math.floor(Math.random() * 999999);
      const encodedPrompt = encodeURIComponent(prompt);
      const imageUrl = `${this.pollinationsUrl}/prompt/${encodedPrompt}?seed=${seed}&width=1024&height=1024&nologo=true`;

      // Test if the URL is accessible
      const response = await fetch(imageUrl, {
        timeout: 30000,
      });

      if (!response.ok) {
        return null;
      }

      return {
        url: imageUrl,
        prompt,
        seed,
        timestamp: new Date(),
      };
    } catch (error) {
      console.error("Pollinations generation failed:", error);
      return null;
    }
  }

  /**
   * Check if Fooocus is available
   */
  async isFooocusAvailable(): Promise<boolean> {
    try {
      const response = await fetch(`${this.fooocusUrl}/api/tags`, {
        timeout: 5000,
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Singleton instance
let imageArtistInstance: ImageArtist | null = null;

export function getImageArtist(): ImageArtist {
  if (!imageArtistInstance) {
    imageArtistInstance = new ImageArtist();
  }
  return imageArtistInstance;
}
