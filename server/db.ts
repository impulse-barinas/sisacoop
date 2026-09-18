import { and, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  cooperativeHarvests,
  cooperativeLevels,
  cooperativeParticipants,
  cooperativePayments,
  cooperativeProfiles,
  InsertUser,
  users,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

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

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) return;

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  for (const field of textFields) {
    if (user[field] !== undefined) {
      values[field] = user[field] ?? null;
      updateSet[field] = user[field] ?? null;
    }
  }
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
  values.lastSignedIn ??= new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  const savedUser = await getUserByOpenId(user.openId);
  if (savedUser) await ensureCooperativeData(savedUser.id, savedUser.name);
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result[0];
}

export async function ensureCooperativeData(userId: number, userName?: string | null) {
  const db = await getDb();
  if (!db) return null;

  let profile = (await db.select().from(cooperativeProfiles).where(eq(cooperativeProfiles.userId, userId)).limit(1))[0];
  if (!profile) {
    const accountNumber = String(userId).padStart(4, "0");
    await db.insert(cooperativeProfiles).values({
      userId,
      accountNumber,
      fullName: userName || "Nuevo participante",
    });
    profile = (await db.select().from(cooperativeProfiles).where(eq(cooperativeProfiles.userId, userId)).limit(1))[0];
  }

  const levels = await db.select().from(cooperativeLevels).where(eq(cooperativeLevels.userId, userId));
  if (levels.length === 0) {
    await db.insert(cooperativeLevels).values([
      { userId, levelNumber: 1, status: "available", seedAmount: 200, cultivationAmount: 1000, harvestAmount: 12000, participantCount: 12 },
      { userId, levelNumber: 2, status: "locked", seedAmount: 400, cultivationAmount: 4000, harvestAmount: 48000, participantCount: 12 },
      { userId, levelNumber: 3, status: "locked", seedAmount: 600, cultivationAmount: 7000, harvestAmount: 84000, participantCount: 12 },
      { userId, levelNumber: 4, status: "locked", seedAmount: 800, cultivationAmount: 10000, harvestAmount: 120000, participantCount: 12 },
    ]);
  }

  return { db, profile };
}

export async function getCooperativeDashboard(userId: number, userName?: string | null) {
  const result = await ensureCooperativeData(userId, userName);
  if (!result) return null;
  const { db, profile } = result;
  const levels = await db.select().from(cooperativeLevels).where(eq(cooperativeLevels.userId, userId));
  const levelIds = levels.map(level => level.id);
  const participants = levelIds.length
    ? await db.select().from(cooperativeParticipants).where(or(...levelIds.map(levelId => eq(cooperativeParticipants.levelId, levelId))))
    : [];
  const payments = await db.select().from(cooperativePayments).where(
    or(eq(cooperativePayments.senderUserId, userId), eq(cooperativePayments.receiverUserId, userId)),
  );
  return { profile, levels, participants, payments };
}

export { cooperativeHarvests, cooperativeLevels, cooperativeParticipants, cooperativePayments, cooperativeProfiles, users };
