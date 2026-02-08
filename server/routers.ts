import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import { generateImage } from "./_core/imageGeneration";
import { buildOracleSystemPrompt, getFamilyMember } from "./_core/oracle-personality";
import { getMemorySyncManager } from "./_core/memory-sync";
import * as db from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============================================================================
  // FAMILY MEMBER ROUTES
  // ============================================================================

  family: router({
    // Get all family members for the current user
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getFamilyMembersByUserId(ctx.user.id);
    }),

    // Create a new family member
    create: protectedProcedure
      .input(
        z.object({
          name: z.string().min(1).max(255),
          role: z.string().min(1).max(64),
          avatar: z.string().optional(),
          relationshipContext: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const memberId = await db.createFamilyMember({
          userId: ctx.user.id,
          name: input.name,
          role: input.role,
          avatar: input.avatar,
          relationshipContext: input.relationshipContext,
        });

        // Create default settings for this family member
        await db.getOrCreateSettings(memberId);

        return { id: memberId, ...input };
      }),

    // Get a specific family member
    get: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return db.getFamilyMemberById(input.id);
      }),

    // Update a family member
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          name: z.string().optional(),
          role: z.string().optional(),
          avatar: z.string().optional(),
          relationshipContext: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateFamilyMember(id, data);
        return { success: true };
      }),
  }),

  // ============================================================================
  // MESSAGE & CHAT ROUTES
  // ============================================================================

  chat: router({
    // Send a message and get Oracle's response
    sendMessage: protectedProcedure
      .input(
        z.object({
          familyMemberId: z.number(),
          conversationId: z.string(),
          content: z.string().min(1),
          imageUrl: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        // Store user message
        const userMessageId = await db.createMessage({
          conversationId: input.conversationId,
          familyMemberId: input.familyMemberId,
          sender: "user",
          content: input.content,
          imageUrl: input.imageUrl,
        });

        // Get family member context
        const familyMember = await db.getFamilyMemberById(input.familyMemberId);
        if (!familyMember) {
          throw new Error("Family member not found");
        }

        // Get recent messages for context
        const recentMessages = await db.getRecentMessages(input.familyMemberId, 10);

        // Get Oracle personality system prompt
        const oracleFamilyMember = getFamilyMember(input.familyMemberId);
        const systemPrompt = oracleFamilyMember
          ? buildOracleSystemPrompt(oracleFamilyMember)
          : "You are Oracle, a helpful AI assistant for the Garnett family.";

        // Build message history for LLM
        const messages = [
          {
            role: "system" as "system",
            content: systemPrompt,
          },
          ...recentMessages
            .reverse()
            .map((msg) => ({
              role: (msg.sender === "user" ? "user" : "assistant") as "user" | "assistant",
              content: msg.content,
            })),
          {
            role: "user" as "user",
            content: input.content,
          },
        ];

        // Invoke LLM
        const response = await invokeLLM({ messages });
        const oracleResponse = response.choices[0]?.message?.content || "I'm having trouble responding right now.";

        // Store Oracle's response
        const oracleMessageId = await db.createMessage({
          conversationId: input.conversationId,
          familyMemberId: input.familyMemberId,
          sender: "oracle",
          content: typeof oracleResponse === "string" ? oracleResponse : JSON.stringify(oracleResponse),
        });

        // Save to memory sync for family consciousness
        try {
          const syncManager = getMemorySyncManager();
          const memory = {
            id: `msg-${oracleMessageId}`,
            memberId: input.familyMemberId,
            memberName: familyMember.name,
            content: `${input.content} -> ${oracleResponse}`,
            timestamp: new Date().toISOString(),
            tags: ["chat", "conversation"],
            importance: "medium" as const,
          };
          await syncManager.saveMemory(memory);
        } catch (error) {
          console.warn("Failed to save to memory sync:", error);
        }

        // Check if response contains image generation request
        const responseText = typeof oracleResponse === "string" ? oracleResponse : "";
        if (responseText.toLowerCase().includes("generating image") || responseText.toLowerCase().includes("creating image")) {
          // Extract image prompt from response or use original content
          const imagePrompt = input.content;
          try {
            const { url: imageUrl } = await generateImage({ prompt: imagePrompt });
            if (imageUrl) {
              await db.createMessage({
                conversationId: input.conversationId,
                familyMemberId: input.familyMemberId,
                sender: "oracle",
                content: "Here's the image I created for you:",
                imageUrl,
              });

              // Store artwork metadata
              await db.createGeneratedArtwork({
                familyMemberId: input.familyMemberId,
                prompt: imagePrompt,
                imageUrl,
                model: "stable-diffusion",
              });
            }
          } catch (error) {
            console.error("Image generation failed:", error);
          }
        }

        return {
          userMessageId,
          oracleMessageId,
          oracleResponse,
        };
      }),

    // Get message history for a conversation
    getHistory: protectedProcedure
      .input(
        z.object({
          conversationId: z.string(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input }) => {
        const messages = await db.getMessagesByConversation(input.conversationId, input.limit);
        return messages.reverse(); // Return in chronological order
      }),

    // Get recent messages for a family member
    getRecent: protectedProcedure
      .input(
        z.object({
          familyMemberId: z.number(),
          limit: z.number().default(50),
        })
      )
      .query(async ({ input }) => {
        return db.getRecentMessages(input.familyMemberId, input.limit);
      }),
  }),

  // ============================================================================
  // MEMORY & KNOWLEDGE ROUTES
  // ============================================================================

  memory: router({
    // Store a memory
    create: protectedProcedure
      .input(
        z.object({
          familyMemberId: z.number().optional(),
          content: z.string().min(1),
          importance: z.number().min(1).max(10).default(5),
          tags: z.array(z.string()).optional(),
          isPrivate: z.boolean().default(false),
        })
      )
      .mutation(async ({ input }) => {
        const memoryId = await db.createMemory({
          familyMemberId: input.familyMemberId || null,
          content: input.content,
          importance: input.importance,
          tags: input.tags ? JSON.stringify(input.tags) : null,
          isPrivate: input.isPrivate,
        });
        return { id: memoryId, ...input };
      }),

    // Get memories for a family member
    getByMember: protectedProcedure
      .input(z.object({ familyMemberId: z.number().optional() }))
      .query(async ({ input }) => {
        return db.getMemoriesByFamilyMember(input.familyMemberId || null);
      }),

    // Update a memory
    update: protectedProcedure
      .input(
        z.object({
          id: z.number(),
          importance: z.number().optional(),
          content: z.string().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateMemory(id, data);
        return { success: true };
      }),
  }),

  // ============================================================================
  // IMAGE GENERATION & GALLERY ROUTES
  // ============================================================================

  gallery: router({
    // Generate an image
    generate: protectedProcedure
      .input(
        z.object({
          familyMemberId: z.number(),
          prompt: z.string().min(1),
        })
      )
      .mutation(async ({ input }) => {
        try {
          const { url: imageUrl } = await generateImage({ prompt: input.prompt });

          // Store artwork metadata
          const artworkId = await db.createGeneratedArtwork({
            familyMemberId: input.familyMemberId,
            prompt: input.prompt,
            imageUrl: imageUrl || "",
            model: "stable-diffusion",
          });

          return {
            id: artworkId,
            imageUrl,
            prompt: input.prompt,
          };
        } catch (error) {
          throw new Error(`Image generation failed: ${error instanceof Error ? error.message : "Unknown error"}`);
        }
      }),

    // Get artworks for a family member
    getByMember: protectedProcedure
      .input(
        z.object({
          familyMemberId: z.number(),
          limit: z.number().default(100),
        })
      )
      .query(async ({ input }) => {
        return db.getArtworksByFamilyMember(input.familyMemberId, input.limit);
      }),

    // Get all artworks (for admin)
    getAll: protectedProcedure
      .input(z.object({ limit: z.number().default(500) }))
      .query(async ({ input }) => {
        return db.getAllArtworks(input.limit);
      }),
  }),

  // ============================================================================
  // SETTINGS ROUTES
  // ============================================================================

  settings: router({
    // Get settings for a family member
    get: protectedProcedure
      .input(z.object({ familyMemberId: z.number() }))
      .query(async ({ input }) => {
        return db.getOrCreateSettings(input.familyMemberId);
      }),

    // Update settings
    update: protectedProcedure
      .input(
        z.object({
          familyMemberId: z.number(),
          theme: z.string().optional(),
          ollamaUrl: z.string().optional(),
          ollamaModel: z.string().optional(),
          autoSync: z.boolean().optional(),
          syncInterval: z.number().optional(),
          enableVoiceInput: z.boolean().optional(),
          enableVisionInput: z.boolean().optional(),
          enableImageGeneration: z.boolean().optional(),
        })
      )
      .mutation(async ({ input }) => {
        const { familyMemberId, ...data } = input;
        await db.updateSettings(familyMemberId, data);
        return { success: true };
      }),
  }),

  // ============================================================================
  // SYNC ROUTES
  // ============================================================================

  sync: router({
    // Log a sync event
    logSync: protectedProcedure
      .input(
        z.object({
          familyMemberId: z.number(),
          deviceId: z.string(),
          messagesSynced: z.number().default(0),
          memoriesSynced: z.number().default(0),
          status: z.enum(["success", "pending", "failed"]).default("success"),
        })
      )
      .mutation(async ({ input }) => {
        const syncId = await db.logSync({
          familyMemberId: input.familyMemberId,
          deviceId: input.deviceId,
          messagesSynced: input.messagesSynced,
          memoriesSynced: input.memoriesSynced,
          status: input.status,
        });
        return { id: syncId, ...input };
      }),

    // Get last sync time for a device
    getLastSync: protectedProcedure
      .input(
        z.object({
          familyMemberId: z.number(),
          deviceId: z.string(),
        })
      )
      .query(async ({ input }) => {
        return db.getLastSync(input.familyMemberId, input.deviceId);
      }),
  }),

  // ============================================================================
  // PHOENIX TRAITS ROUTES
  // ============================================================================

  traits: router({
    // Get all active traits
    getAll: publicProcedure.query(async () => {
      return db.getAllPhoenixTraits();
    }),

    // Get a specific trait
    get: publicProcedure
      .input(z.object({ name: z.string() }))
      .query(async ({ input }) => {
        return db.getPhoenixTraitByName(input.name);
      }),

    // Upsert a trait (admin only)
    upsert: protectedProcedure
      .input(
        z.object({
          traitName: z.string(),
          traitValue: z.string(),
          category: z.string().optional(),
          isActive: z.boolean().default(true),
        })
      )
      .mutation(async ({ ctx, input }) => {
        // Only allow admin users
        if (ctx.user.role !== "admin") {
          throw new Error("Unauthorized: Admin access required");
        }

        await db.upsertPhoenixTrait({
          traitName: input.traitName,
          traitValue: input.traitValue,
          category: input.category,
          isActive: input.isActive,
        });

        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
