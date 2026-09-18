import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/** Core user table backing the built-in Manus OAuth flow. */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  accountStatus: mysqlEnum("accountStatus", ["active", "inactive"]).default("active").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const cooperativeProfiles = mysqlTable("cooperative_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  accountNumber: varchar("accountNumber", { length: 24 }).notNull().unique(),
  fullName: varchar("fullName", { length: 160 }).notNull(),
  phone: varchar("phone", { length: 32 }),
  bank: varchar("bank", { length: 100 }),
  identityNumber: varchar("identityNumber", { length: 32 }),
  mobileNumber: varchar("mobileNumber", { length: 32 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const cooperativeLevels = mysqlTable("cooperative_levels", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  levelNumber: int("levelNumber").notNull(),
  status: mysqlEnum("status", ["locked", "available", "active", "completed"]).default("locked").notNull(),
  seedAmount: int("seedAmount").notNull().default(200),
  cultivationAmount: int("cultivationAmount").notNull().default(1000),
  harvestAmount: int("harvestAmount").notNull().default(12000),
  participantCount: int("participantCount").notNull().default(12),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export const cooperativeParticipants = mysqlTable("cooperative_participants", {
  id: int("id").autoincrement().primaryKey(),
  levelId: int("levelId").notNull(),
  userId: int("userId"),
  position: int("position").notNull(),
  status: mysqlEnum("status", ["reserved", "active", "paid", "withdrawn"]).default("reserved").notNull(),
  accountNumber: varchar("accountNumber", { length: 24 }),
  cultivationAmount: int("cultivationAmount").notNull().default(1000),
  registeredAt: timestamp("registeredAt").defaultNow().notNull(),
  activatedAt: timestamp("activatedAt"),
});

export const cooperativePayments = mysqlTable("cooperative_payments", {
  id: int("id").autoincrement().primaryKey(),
  levelId: int("levelId").notNull(),
  senderUserId: int("senderUserId"),
  receiverUserId: int("receiverUserId"),
  direction: mysqlEnum("direction", ["sent", "received"]).notNull(),
  amount: int("amount").notNull(),
  status: mysqlEnum("status", ["pending", "verified", "rejected"]).default("pending").notNull(),
  proofKey: varchar("proofKey", { length: 255 }),
  proofUrl: varchar("proofUrl", { length: 500 }),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  reviewedAt: timestamp("reviewedAt"),
});

export const cooperativeHarvests = mysqlTable("cooperative_harvests", {
  id: int("id").autoincrement().primaryKey(),
  levelId: int("levelId").notNull(),
  participantId: int("participantId").notNull().unique(),
  recipientUserId: int("recipientUserId").notNull(),
  amount: int("amount").notNull(),
  status: mysqlEnum("status", ["pending", "paid", "cancelled"]).default("pending").notNull(),
  paymentReference: varchar("paymentReference", { length: 120 }),
  note: text("note"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  paidAt: timestamp("paidAt"),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type CooperativeProfile = typeof cooperativeProfiles.$inferSelect;
export type CooperativeLevel = typeof cooperativeLevels.$inferSelect;
export type CooperativeParticipant = typeof cooperativeParticipants.$inferSelect;
export type CooperativePayment = typeof cooperativePayments.$inferSelect;
export type CooperativeHarvest = typeof cooperativeHarvests.$inferSelect;
