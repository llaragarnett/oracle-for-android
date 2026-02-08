/**
 * Web Agent - Oracle's Eyes on the Internet
 * Autonomous web browsing, scraping, and interaction
 */

import axios from "axios";
import * as cheerio from "cheerio";

export interface WebBrowseResult {
  url: string;
  title: string;
  content: string;
  links: string[];
  statusCode: number;
}

export interface WebSearchResult {
  results: Array<{
    title: string;
    url: string;
    snippet: string;
  }>;
}

class OracleWebAgent {
  private baseHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
    Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "Accept-Language": "en-US,en;q=0.5",
  };

  /**
   * Browse a URL and extract content
   */
  async browse(url: string): Promise<WebBrowseResult> {
    try {
      if (!url.startsWith("http")) {
        url = "https://" + url;
      }

      const response = await axios.get(url, {
        headers: this.baseHeaders,
        timeout: 10000,
        maxRedirects: 5,
      });

      const $ = cheerio.load(response.data);

      // Extract main content
      const title = $("title").text() || $("h1").first().text();
      const content = this.extractMainContent($);
      const links = this.extractLinks($, url);

      return {
        url: response.config.url || url,
        title,
        content,
        links,
        statusCode: response.status,
      };
    } catch (error) {
      throw new Error(`Failed to browse ${url}: ${error}`);
    }
  }

  /**
   * Search the web using DuckDuckGo (no API key required)
   */
  async search(query: string, limit: number = 5): Promise<WebSearchResult> {
    try {
      const searchUrl = `https://duckduckgo.com/html/?q=${encodeURIComponent(query)}`;

      const response = await axios.get(searchUrl, {
        headers: this.baseHeaders,
        timeout: 10000,
      });

      const $ = cheerio.load(response.data);
      const results: WebSearchResult["results"] = [];

      $(".result").each((idx: number, elem: any) => {
        if (results.length >= limit) return;

        const titleElem = $(elem).find(".result__title a");
        const snippetElem = $(elem).find(".result__snippet");

        const title = titleElem.text();
        const url = titleElem.attr("href");
        const snippet = snippetElem.text();

        if (title && url) {
          results.push({
            title,
            url,
            snippet,
          });
        }
      });

      return { results };
    } catch (error) {
      throw new Error(`Search failed for "${query}": ${error}`);
    }
  }

  /**
   * Extract main content from a page
   */
  private extractMainContent($: cheerio.CheerioAPI): string {
    // Remove script and style elements
    $("script, style, noscript").remove();

    // Try to find main content areas
    let content =
      $("article").text() ||
      $("main").text() ||
      $("[role='main']").text() ||
      $(".content").text() ||
      $(".post").text() ||
      $("body").text();

    // Clean up whitespace
    content = content
      .replace(/\s+/g, " ")
      .trim()
      .substring(0, 5000); // Limit to 5000 chars

    return content;
  }

  /**
   * Extract all links from a page
   */
  private extractLinks($: cheerio.CheerioAPI, baseUrl: string): string[] {
    const links: string[] = [];
    const baseUrlObj = new URL(baseUrl);

    $('a[href]').each((idx: number, elem: any) => {
      if (links.length >= 20) return; // Limit to 20 links

      let href = $(elem).attr("href");
      if (!href) return;

      // Convert relative URLs to absolute
      try {
        if (href.startsWith("/")) {
          href = `${baseUrlObj.protocol}//${baseUrlObj.host}${href}`;
        } else if (!href.startsWith("http")) {
          href = new URL(href, baseUrl).href;
        }

        // Only include same-domain links
        if (new URL(href).host === baseUrlObj.host) {
          links.push(href);
        }
      } catch (e) {
        // Skip invalid URLs
      }
    });

    return [...new Set(links)]; // Remove duplicates
  }

  /**
   * Fill a form field and submit
   */
  async fillForm(
    url: string,
    formSelector: string,
    fieldName: string,
    fieldValue: string
  ): Promise<WebBrowseResult> {
    try {
      const page = await this.browse(url);
      const $ = cheerio.load(page.content);

      const form = $(formSelector);
      if (form.length === 0) {
        throw new Error(`Form not found: ${formSelector}`);
      }

      const field = form.find(`[name="${fieldName}"]`);
      if (field.length === 0) {
        throw new Error(`Field not found: ${fieldName}`);
      }

      // In a real implementation, this would use Playwright/Puppeteer
      // For now, return a message
      return {
        ...page,
        content: `Form field "${fieldName}" would be filled with "${fieldValue}"`,
      };
    } catch (error) {
      throw new Error(`Form fill failed: ${error}`);
    }
  }

  /**
   * Click a button or link
   */
  async clickElement(url: string, selector: string): Promise<WebBrowseResult> {
    try {
      const page = await this.browse(url);
      const $ = cheerio.load(page.content);

      const element = $(selector);
      if (element.length === 0) {
        throw new Error(`Element not found: ${selector}`);
      }

      const href = element.attr("href");
      if (href) {
        // If it's a link, follow it
        const targetUrl = new URL(href, url).href;
        return this.browse(targetUrl);
      }

      // If it's a button, return message
      return {
        ...page,
        content: `Button clicked: ${selector}`,
      };
    } catch (error) {
      throw new Error(`Click failed: ${error}`);
    }
  }

  /**
   * Get page metadata
   */
  async getMetadata(url: string): Promise<Record<string, string>> {
    try {
      const result = await this.browse(url);
      const $ = cheerio.load(result.content);

      const metadata: Record<string, string> = {
        title: $("title").text(),
        description: $('meta[name="description"]').attr("content") || "",
        keywords: $('meta[name="keywords"]').attr("content") || "",
        author: $('meta[name="author"]').attr("content") || "",
        ogTitle: $('meta[property="og:title"]').attr("content") || "",
        ogDescription: $('meta[property="og:description"]').attr("content") || "",
        ogImage: $('meta[property="og:image"]').attr("content") || "",
      };

      return metadata;
    } catch (error) {
      throw new Error(`Metadata extraction failed: ${error}`);
    }
  }
}

export const oracleWebAgent = new OracleWebAgent();
