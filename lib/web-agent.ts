/**
 * Web Agent System
 * Autonomous web browsing, searching, and content extraction
 */

export interface WebSearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface WebPageContent {
  title: string;
  url: string;
  content: string;
  links: string[];
}

export class WebAgent {
  /**
   * Search the web using DuckDuckGo
   */
  async search(query: string): Promise<WebSearchResult[]> {
    try {
      const encodedQuery = encodeURIComponent(query);
      const response = await fetch(
        `https://duckduckgo.com/?q=${encodedQuery}&format=json&no_redirect=1`,
        {
          timeout: 10000,
        }
      );

      if (!response.ok) {
        return [];
      }

      const data = await response.json();
      const results: WebSearchResult[] = [];

      // Extract results from DuckDuckGo response
      if (data.Results && Array.isArray(data.Results)) {
        for (const result of data.Results.slice(0, 5)) {
          results.push({
            title: result.Title || "",
            url: result.FirstURL || "",
            snippet: result.Text || "",
          });
        }
      }

      return results;
    } catch (error) {
      console.error("Web search failed:", error);
      return [];
    }
  }

  /**
   * Fetch and parse a webpage
   */
  async fetchPage(url: string): Promise<WebPageContent | null> {
    try {
      if (!url.startsWith("http")) {
        url = "https://" + url;
      }

      const response = await fetch(url, {
        timeout: 15000,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
        },
      });

      if (!response.ok) {
        return null;
      }

      const html = await response.text();

      // Simple HTML parsing to extract content
      const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      const title = titleMatch ? titleMatch[1] : "Untitled";

      // Extract all links
      const linkMatches = html.match(/href=["']([^"']+)["']/g) || [];
      const links = linkMatches
        .map((match) => match.replace(/href=["']|["']/g, ""))
        .filter((link) => link.startsWith("http"));

      // Extract main content (simplified)
      const contentMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
      let content = contentMatch ? contentMatch[1] : html;

      // Remove scripts and styles
      content = content.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
      content = content.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");

      // Remove HTML tags
      content = content.replace(/<[^>]+>/g, " ");

      // Clean up whitespace
      content = content
        .replace(/\s+/g, " ")
        .trim()
        .substring(0, 2000); // Limit to 2000 chars

      return {
        title,
        url,
        content,
        links: links.slice(0, 10),
      };
    } catch (error) {
      console.error("Failed to fetch page:", error);
      return null;
    }
  }

  /**
   * Perform a complete web search and fetch the top result
   */
  async searchAndFetch(query: string): Promise<string> {
    try {
      const results = await this.search(query);

      if (results.length === 0) {
        return "No search results found for: " + query;
      }

      const topResult = results[0];
      const pageContent = await this.fetchPage(topResult.url);

      if (!pageContent) {
        return `Found result but couldn't fetch: ${topResult.title}\n${topResult.snippet}`;
      }

      return `Title: ${pageContent.title}\nURL: ${pageContent.url}\n\nContent:\n${pageContent.content}`;
    } catch (error) {
      return `Web search failed: ${error instanceof Error ? error.message : "Unknown error"}`;
    }
  }
}

// Singleton instance
let webAgentInstance: WebAgent | null = null;

export function getWebAgent(): WebAgent {
  if (!webAgentInstance) {
    webAgentInstance = new WebAgent();
  }
  return webAgentInstance;
}
