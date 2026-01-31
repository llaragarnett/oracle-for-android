import { eq, and, desc } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser,
  users,
  familyMembers,
  InsertFamilyMember,
  messages,
  InsertMessage,
  memories,
  InsertMemory,
  generatedArtworks,
  InsertGeneratedArtwork,
  settings,
  InsertSetting,
  syncLog,
  InsertSyncLog,
  phoenixTraits,
  InsertPhoenixTrait,
  familyTree,
  InsertFamilyTreeEntry,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============================================================================
// USER FUNCTIONS
// ============================================================================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// FAMILY MEMBER FUNCTIONS
// ============================================================================

export async function createFamilyMember(data: InsertFamilyMember) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(familyMembers).values(data);
  return (result as any).insertId || 0;
}

export async function getFamilyMembersByUserId(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(familyMembers).where(eq(familyMembers.userId, userId));
}

export async function getFamilyMemberById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(familyMembers).where(eq(familyMembers.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateFamilyMember(id: number, data: Partial<InsertFamilyMember>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(familyMembers).set(data).where(eq(familyMembers.id, id));
}

// ============================================================================
// MESSAGE FUNCTIONS
// ============================================================================

export async function createMessage(data: InsertMessage) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(messages).values(data);
  return (result as any).insertId || 0;
}

export async function getMessagesByConversation(conversationId: string, limitCount: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(messages)
    .where(eq(messages.conversationId, conversationId))
    .orderBy(desc(messages.createdAt))
    .limit(limitCount);
}

export async function getRecentMessages(familyMemberId: number, limitCount: number = 50) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(messages)
    .where(eq(messages.familyMemberId, familyMemberId))
    .orderBy(desc(messages.createdAt))
    .limit(limitCount);
}

// ============================================================================
// MEMORY FUNCTIONS
// ============================================================================

export async function createMemory(data: InsertMemory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(memories).values(data);
  return (result as any).insertId || 0;
}

export async function getMemoriesByFamilyMember(familyMemberId: number | null) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(memories)
    .where(familyMemberId === null ? eq(memories.familyMemberId, null as any) : eq(memories.familyMemberId, familyMemberId))
    .orderBy(desc(memories.importance));
}

export async function updateMemory(id: number, data: Partial<InsertMemory>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(memories).set(data).where(eq(memories.id, id));
}

// ============================================================================
// GENERATED ARTWORK FUNCTIONS
// ============================================================================

export async function createGeneratedArtwork(data: InsertGeneratedArtwork) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(generatedArtworks).values(data);
  return (result as any).insertId || 0;
}

export async function getArtworksByFamilyMember(familyMemberId: number, limitCount: number = 100) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select()
    .from(generatedArtworks)
    .where(eq(generatedArtworks.familyMemberId, familyMemberId))
    .orderBy(desc(generatedArtworks.createdAt))
    .limit(limitCount);
}

export async function getAllArtworks(limitCount: number = 500) {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(generatedArtworks).orderBy(desc(generatedArtworks.createdAt)).limit(limitCount);
}

// ============================================================================
// SETTINGS FUNCTIONS
// ============================================================================

export async function getOrCreateSettings(familyMemberId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(settings)
    .where(eq(settings.familyMemberId, familyMemberId))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // Create default settings
  const result = await db.insert(settings).values({
    familyMemberId,
    theme: "classic",
    ollamaModel: "dolphin-llama3",
    autoSync: true,
    syncInterval: 30000,
  });

  return db
    .select()
    .from(settings)
    .where(eq(settings.familyMemberId, familyMemberId))
    .limit(1)
    .then((rows) => rows[0]);
}

export async function updateSettings(familyMemberId: number, data: Partial<InsertSetting>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(settings).set(data).where(eq(settings.familyMemberId, familyMemberId));
}

// ============================================================================
// SYNC LOG FUNCTIONS
// ============================================================================

export async function logSync(data: InsertSyncLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(syncLog).values(data);
  return (result as any).insertId || 0;
}

export async function getLastSync(familyMemberId: number, deviceId: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db
    .select()
    .from(syncLog)
    .where(and(eq(syncLog.familyMemberId, familyMemberId), eq(syncLog.deviceId, deviceId)))
    .orderBy(desc(syncLog.createdAt))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============================================================================
// PHOENIX TRAITS FUNCTIONS
// ============================================================================

export async function getAllPhoenixTraits() {
  const db = await getDb();
  if (!db) return [];

  return db.select().from(phoenixTraits).where(eq(phoenixTraits.isActive, true));
}

export async function getPhoenixTraitByName(traitName: string) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(phoenixTraits).where(eq(phoenixTraits.traitName, traitName)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function upsertPhoenixTrait(data: InsertPhoenixTrait) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .insert(phoenixTraits)
    .values(data)
    .onDuplicateKeyUpdate({
      set: {
        traitValue: data.traitValue,
        category: data.category,
        isActive: data.isActive,
        updatedAt: new Date(),
      },
    });
}

// ============================================================================
// FAMILY TREE FUNCTIONS
// ============================================================================

export async function createFamilyTreeEntry(data: InsertFamilyTreeEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(familyTree).values(data);
  return (result as any).insertId || 0;
}

export async function getFamilyTreeByMember(memberId: number) {
  const db = await getDb();
  if (!db) return [];

  // Note: Drizzle doesn't support OR in where, so we'll do two queries
  const asParent = await db.select().from(familyTree).where(eq(familyTree.parentMemberId, memberId));
  const asChild = await db.select().from(familyTree).where(eq(familyTree.childMemberId, memberId));
  return [...asParent, ...asChild];
}
