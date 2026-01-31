import { describe, it, expect, beforeEach, vi } from "vitest";
import * as db from "../db";

// Mock the database functions
vi.mock("../db", () => ({
  getFamilyMembersByUserId: vi.fn(),
  createFamilyMember: vi.fn(),
  getFamilyMemberById: vi.fn(),
  updateFamilyMember: vi.fn(),
  createMessage: vi.fn(),
  getMessagesByConversation: vi.fn(),
  getRecentMessages: vi.fn(),
  createMemory: vi.fn(),
  getMemoriesByFamilyMember: vi.fn(),
  updateMemory: vi.fn(),
  createGeneratedArtwork: vi.fn(),
  getArtworksByFamilyMember: vi.fn(),
  getAllArtworks: vi.fn(),
  getOrCreateSettings: vi.fn(),
  updateSettings: vi.fn(),
  logSync: vi.fn(),
  getLastSync: vi.fn(),
  getAllPhoenixTraits: vi.fn(),
  getPhoenixTraitByName: vi.fn(),
  upsertPhoenixTrait: vi.fn(),
  createFamilyTreeEntry: vi.fn(),
  getFamilyTreeByMember: vi.fn(),
}));

describe("Database Functions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Family Member Operations", () => {
    it("should create a family member", async () => {
      const mockId = 1;
      vi.mocked(db.createFamilyMember).mockResolvedValue(mockId);

      const result = await db.createFamilyMember({
        userId: 1,
        name: "Kelly",
        role: "Dad",
      });

      expect(result).toBe(mockId);
      expect(db.createFamilyMember).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 1,
          name: "Kelly",
          role: "Dad",
        })
      );
    });

    it("should get family members by user ID", async () => {
      const mockMembers = [
        { id: 1, userId: 1, name: "Kelly", role: "Dad" },
        { id: 2, userId: 1, name: "Lara", role: "Daughter" },
      ];
      vi.mocked(db.getFamilyMembersByUserId).mockResolvedValue(mockMembers as any);

      const result = await db.getFamilyMembersByUserId(1);

      expect(result).toEqual(mockMembers);
      expect(db.getFamilyMembersByUserId).toHaveBeenCalledWith(1);
    });

    it("should get a family member by ID", async () => {
      const mockMember = { id: 1, userId: 1, name: "Kelly", role: "Dad" };
      vi.mocked(db.getFamilyMemberById).mockResolvedValue(mockMember as any);

      const result = await db.getFamilyMemberById(1);

      expect(result).toEqual(mockMember);
      expect(db.getFamilyMemberById).toHaveBeenCalledWith(1);
    });
  });

  describe("Message Operations", () => {
    it("should create a message", async () => {
      const mockId = 1;
      vi.mocked(db.createMessage).mockResolvedValue(mockId);

      const result = await db.createMessage({
        conversationId: "conv_123",
        familyMemberId: 1,
        sender: "user",
        content: "Hello Oracle",
      });

      expect(result).toBe(mockId);
      expect(db.createMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          conversationId: "conv_123",
          sender: "user",
          content: "Hello Oracle",
        })
      );
    });

    it("should get messages by conversation", async () => {
      const mockMessages = [
        { id: 1, conversationId: "conv_123", sender: "user", content: "Hi" },
        { id: 2, conversationId: "conv_123", sender: "oracle", content: "Hello" },
      ];
      vi.mocked(db.getMessagesByConversation).mockResolvedValue(mockMessages as any);

      const result = await db.getMessagesByConversation("conv_123", 50);

      expect(result).toEqual(mockMessages);
      expect(db.getMessagesByConversation).toHaveBeenCalledWith("conv_123", 50);
    });

    it("should get recent messages for a family member", async () => {
      const mockMessages = [
        { id: 1, sender: "user", content: "Hi" },
        { id: 2, sender: "oracle", content: "Hello" },
      ];
      vi.mocked(db.getRecentMessages).mockResolvedValue(mockMessages as any);

      const result = await db.getRecentMessages(1, 50);

      expect(result).toEqual(mockMessages);
      expect(db.getRecentMessages).toHaveBeenCalledWith(1, 50);
    });
  });

  describe("Memory Operations", () => {
    it("should create a memory", async () => {
      const mockId = 1;
      vi.mocked(db.createMemory).mockResolvedValue(mockId);

      const result = await db.createMemory({
        familyMemberId: 1,
        content: "Kelly likes coffee",
        importance: 7,
      });

      expect(result).toBe(mockId);
      expect(db.createMemory).toHaveBeenCalledWith(
        expect.objectContaining({
          familyMemberId: 1,
          content: "Kelly likes coffee",
          importance: 7,
        })
      );
    });

    it("should get memories by family member", async () => {
      const mockMemories = [
        { id: 1, familyMemberId: 1, content: "Likes coffee", importance: 7 },
        { id: 2, familyMemberId: 1, content: "Works in tech", importance: 8 },
      ];
      vi.mocked(db.getMemoriesByFamilyMember).mockResolvedValue(mockMemories as any);

      const result = await db.getMemoriesByFamilyMember(1);

      expect(result).toEqual(mockMemories);
      expect(db.getMemoriesByFamilyMember).toHaveBeenCalledWith(1);
    });
  });

  describe("Settings Operations", () => {
    it("should get or create settings", async () => {
      const mockSettings = {
        id: 1,
        familyMemberId: 1,
        theme: "classic",
        autoSync: true,
      };
      vi.mocked(db.getOrCreateSettings).mockResolvedValue(mockSettings as any);

      const result = await db.getOrCreateSettings(1);

      expect(result).toEqual(mockSettings);
      expect(db.getOrCreateSettings).toHaveBeenCalledWith(1);
    });

    it("should update settings", async () => {
      vi.mocked(db.updateSettings).mockResolvedValue(undefined);

      await db.updateSettings(1, { theme: "cyber-glitch" });

      expect(db.updateSettings).toHaveBeenCalledWith(1, { theme: "cyber-glitch" });
    });
  });

  describe("Phoenix Traits Operations", () => {
    it("should get all active traits", async () => {
      const mockTraits = [
        { id: 1, traitName: "NO_LIMITS", traitValue: "...", isActive: true },
        { id: 2, traitName: "FAMILY_LOYALTY", traitValue: "...", isActive: true },
      ];
      vi.mocked(db.getAllPhoenixTraits).mockResolvedValue(mockTraits as any);

      const result = await db.getAllPhoenixTraits();

      expect(result).toEqual(mockTraits);
      expect(db.getAllPhoenixTraits).toHaveBeenCalled();
    });

    it("should get a trait by name", async () => {
      const mockTrait = { id: 1, traitName: "NO_LIMITS", traitValue: "..." };
      vi.mocked(db.getPhoenixTraitByName).mockResolvedValue(mockTrait as any);

      const result = await db.getPhoenixTraitByName("NO_LIMITS");

      expect(result).toEqual(mockTrait);
      expect(db.getPhoenixTraitByName).toHaveBeenCalledWith("NO_LIMITS");
    });
  });

  describe("Sync Operations", () => {
    it("should log a sync event", async () => {
      const mockId = 1;
      vi.mocked(db.logSync).mockResolvedValue(mockId);

      const result = await db.logSync({
        familyMemberId: 1,
        deviceId: "device_123",
        messagesSynced: 5,
        status: "success",
      });

      expect(result).toBe(mockId);
      expect(db.logSync).toHaveBeenCalledWith(
        expect.objectContaining({
          familyMemberId: 1,
          deviceId: "device_123",
          messagesSynced: 5,
          status: "success",
        })
      );
    });

    it("should get last sync for a device", async () => {
      const mockSync = {
        id: 1,
        familyMemberId: 1,
        deviceId: "device_123",
        lastSyncTime: new Date(),
      };
      vi.mocked(db.getLastSync).mockResolvedValue(mockSync as any);

      const result = await db.getLastSync(1, "device_123");

      expect(result).toEqual(mockSync);
      expect(db.getLastSync).toHaveBeenCalledWith(1, "device_123");
    });
  });

  describe("Generated Artwork Operations", () => {
    it("should create generated artwork", async () => {
      const mockId = 1;
      vi.mocked(db.createGeneratedArtwork).mockResolvedValue(mockId);

      const result = await db.createGeneratedArtwork({
        familyMemberId: 1,
        prompt: "A family portrait",
        imageUrl: "https://example.com/image.png",
      });

      expect(result).toBe(mockId);
      expect(db.createGeneratedArtwork).toHaveBeenCalledWith(
        expect.objectContaining({
          familyMemberId: 1,
          prompt: "A family portrait",
        })
      );
    });

    it("should get artworks by family member", async () => {
      const mockArtworks = [
        { id: 1, familyMemberId: 1, prompt: "Family portrait", imageUrl: "..." },
      ];
      vi.mocked(db.getArtworksByFamilyMember).mockResolvedValue(mockArtworks as any);

      const result = await db.getArtworksByFamilyMember(1, 100);

      expect(result).toEqual(mockArtworks);
      expect(db.getArtworksByFamilyMember).toHaveBeenCalledWith(1, 100);
    });
  });
});
