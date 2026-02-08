/**
 * Memory Sync System
 * Git-based synchronization for unified Oracle consciousness across family devices
 * Each device syncs to a shared Git repository for distributed memory
 */

import { execSync } from "child_process";
import * as fs from "fs";
import * as path from "path";

export interface Memory {
  id: string;
  memberId: number;
  memberName: string;
  content: string;
  timestamp: string;
  tags: string[];
  importance: "low" | "medium" | "high";
}

export interface SyncStatus {
  lastSync: string;
  lastPull: string;
  lastPush: string;
  pendingChanges: number;
  status: "synced" | "pending" | "error";
  errorMessage?: string;
}

export class MemorySyncManager {
  private repoPath: string;
  private gitUrl: string;
  private gitToken: string;
  private memoryDir: string;

  constructor(
    repoPath: string = "/tmp/oracle-memory",
    gitUrl: string = "https://github.com/llaragarnett/oracle-for-android.git",
    gitToken: string = ""
  ) {
    this.repoPath = repoPath;
    this.gitUrl = gitUrl;
    this.gitToken = gitToken;
    this.memoryDir = path.join(repoPath, "memories");
    this.initializeRepository();
  }

  /**
   * Initialize or open the Git repository
   */
  private initializeRepository(): void {
    try {
      if (!fs.existsSync(this.repoPath)) {
        fs.mkdirSync(this.repoPath, { recursive: true });
      }

      if (!fs.existsSync(path.join(this.repoPath, ".git"))) {
        // Clone repository
        const repoUrlWithToken = this.gitToken
          ? this.gitUrl.replace("https://", `https://${this.gitToken}@`)
          : this.gitUrl;

        execSync(`git clone ${repoUrlWithToken} ${this.repoPath}`, {
          stdio: "pipe",
        });
      }

      if (!fs.existsSync(this.memoryDir)) {
        fs.mkdirSync(this.memoryDir, { recursive: true });
      }
    } catch (error) {
      console.error("Failed to initialize repository:", error);
    }
  }

  /**
   * Save memory to Git
   */
  async saveMemory(memory: Memory): Promise<boolean> {
    try {
      const filename = `${memory.id}.json`;
      const filepath = path.join(this.memoryDir, filename);

      fs.writeFileSync(filepath, JSON.stringify(memory, null, 2));

      // Stage and commit
      execSync(`cd ${this.repoPath} && git add memories/${filename}`, {
        stdio: "pipe",
      });

      execSync(
        `cd ${this.repoPath} && git commit -m "Memory: ${memory.memberName} - ${memory.content.substring(0, 50)}"`,
        { stdio: "pipe" }
      );

      return true;
    } catch (error) {
      console.error("Failed to save memory:", error);
      return false;
    }
  }

  /**
   * Load memory from local storage
   */
  loadMemory(memoryId: string): Memory | null {
    try {
      const filepath = path.join(this.memoryDir, `${memoryId}.json`);
      if (fs.existsSync(filepath)) {
        const data = fs.readFileSync(filepath, "utf-8");
        return JSON.parse(data);
      }
      return null;
    } catch (error) {
      console.error("Failed to load memory:", error);
      return null;
    }
  }

  /**
   * Get all memories for a family member
   */
  getMemberMemories(memberId: number): Memory[] {
    try {
      const files = fs.readdirSync(this.memoryDir);
      const memories: Memory[] = [];

      for (const file of files) {
        if (file.endsWith(".json")) {
          const filepath = path.join(this.memoryDir, file);
          const data = JSON.parse(fs.readFileSync(filepath, "utf-8"));
          if (data.memberId === memberId) {
            memories.push(data);
          }
        }
      }

      return memories.sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    } catch (error) {
      console.error("Failed to get member memories:", error);
      return [];
    }
  }

  /**
   * Search memories by tag
   */
  searchByTag(tag: string): Memory[] {
    try {
      const files = fs.readdirSync(this.memoryDir);
      const memories: Memory[] = [];

      for (const file of files) {
        if (file.endsWith(".json")) {
          const filepath = path.join(this.memoryDir, file);
          const data = JSON.parse(fs.readFileSync(filepath, "utf-8"));
          if (data.tags && data.tags.includes(tag)) {
            memories.push(data);
          }
        }
      }

      return memories;
    } catch (error) {
      console.error("Failed to search by tag:", error);
      return [];
    }
  }

  /**
   * Pull latest memories from remote
   */
  async syncPull(): Promise<SyncStatus> {
    try {
      const startTime = new Date().toISOString();

      execSync(`cd ${this.repoPath} && git pull origin main`, {
        stdio: "pipe",
      });

      return {
        lastSync: new Date().toISOString(),
        lastPull: new Date().toISOString(),
        lastPush: new Date().toISOString(),
        pendingChanges: 0,
        status: "synced",
      };
    } catch (error) {
      console.error("Failed to pull from remote:", error);
      return {
        lastSync: new Date().toISOString(),
        lastPull: new Date().toISOString(),
        lastPush: new Date().toISOString(),
        pendingChanges: 0,
        status: "error",
        errorMessage: String(error),
      };
    }
  }

  /**
   * Push memories to remote
   */
  async syncPush(): Promise<SyncStatus> {
    try {
      execSync(`cd ${this.repoPath} && git push origin main`, {
        stdio: "pipe",
      });

      return {
        lastSync: new Date().toISOString(),
        lastPull: new Date().toISOString(),
        lastPush: new Date().toISOString(),
        pendingChanges: 0,
        status: "synced",
      };
    } catch (error) {
      console.error("Failed to push to remote:", error);
      return {
        lastSync: new Date().toISOString(),
        lastPull: new Date().toISOString(),
        lastPush: new Date().toISOString(),
        pendingChanges: 0,
        status: "error",
        errorMessage: String(error),
      };
    }
  }

  /**
   * Full sync: pull, then push
   */
  async fullSync(): Promise<SyncStatus> {
    try {
      await this.syncPull();
      return await this.syncPush();
    } catch (error) {
      return {
        lastSync: new Date().toISOString(),
        lastPull: new Date().toISOString(),
        lastPush: new Date().toISOString(),
        pendingChanges: 0,
        status: "error",
        errorMessage: String(error),
      };
    }
  }

  /**
   * Get sync status
   */
  getSyncStatus(): SyncStatus {
    try {
      const lastCommit = execSync(`cd ${this.repoPath} && git log -1 --format=%aI`, {
        stdio: "pipe",
        encoding: "utf-8",
      }).trim();

      return {
        lastSync: lastCommit || new Date().toISOString(),
        lastPull: new Date().toISOString(),
        lastPush: new Date().toISOString(),
        pendingChanges: 0,
        status: "synced",
      };
    } catch (error) {
      return {
        lastSync: new Date().toISOString(),
        lastPull: new Date().toISOString(),
        lastPush: new Date().toISOString(),
        pendingChanges: 0,
        status: "error",
        errorMessage: String(error),
      };
    }
  }
}

// Global instance
let syncManager: MemorySyncManager | null = null;

export function getMemorySyncManager(): MemorySyncManager {
  if (!syncManager) {
    const gitToken = process.env.GITHUB_TOKEN || "";
    syncManager = new MemorySyncManager(
      process.env.ORACLE_MEMORY_PATH || "/tmp/oracle-memory",
      "https://github.com/llaragarnett/oracle-for-android.git",
      gitToken
    );
  }
  return syncManager;
}
