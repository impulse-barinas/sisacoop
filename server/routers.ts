import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { storagePut } from "./storage";
import { getCooperativeDashboard, getDb, ensureCooperativeData, cooperativeHarvests, cooperativeLevels, cooperativeParticipants, cooperativePayments, cooperativeProfiles, users } from "./db";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

const profileInput = z.object({
  fullName: z.string().min(2).max(160),
  phone: z.string().max(32).optional(),
  bank: z.string().max(100).optional(),
  identityNumber: z.string().max(32).optional(),
  mobileNumber: z.string().max(32).optional(),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  cooperative: router({
    dashboard: protectedProcedure.query(({ ctx }) => getCooperativeDashboard(ctx.user.id, ctx.user.name)),

    updateProfile: protectedProcedure.input(profileInput).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "La base de datos no está disponible." });
      await ensureCooperativeData(ctx.user.id, ctx.user.name);
      await db.update(cooperativeProfiles).set({ ...input }).where(eq(cooperativeProfiles.userId, ctx.user.id));
      return { success: true } as const;
    }),

    activateLevel: protectedProcedure.input(z.object({ levelNumber: z.number().int().min(1).max(4) })).mutation(async ({ ctx, input }) => {
      const setup = await ensureCooperativeData(ctx.user.id, ctx.user.name);
      if (!setup) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "La base de datos no está disponible." });
      const { db, profile } = setup;
      const level = (await db.select().from(cooperativeLevels).where(and(eq(cooperativeLevels.userId, ctx.user.id), eq(cooperativeLevels.levelNumber, input.levelNumber))).limit(1))[0];
      if (!level) throw new TRPCError({ code: "NOT_FOUND", message: "Nivel no encontrado." });
      if (level.status === "locked") throw new TRPCError({ code: "PRECONDITION_FAILED", message: "Completa el nivel anterior para desbloquear este nivel." });
      if (level.status === "completed") throw new TRPCError({ code: "BAD_REQUEST", message: "Este nivel ya fue completado." });

      await db.update(cooperativeLevels).set({ status: "active", startedAt: level.startedAt ?? new Date() }).where(eq(cooperativeLevels.id, level.id));
      const existing = await db.select().from(cooperativeParticipants).where(and(eq(cooperativeParticipants.levelId, level.id), eq(cooperativeParticipants.userId, ctx.user.id))).limit(1);
      if (existing.length === 0) {
        await db.insert(cooperativeParticipants).values({
          levelId: level.id,
          userId: ctx.user.id,
          position: 1,
          status: "active",
          accountNumber: profile?.accountNumber ?? String(ctx.user.id).padStart(4, "0"),
          cultivationAmount: level.cultivationAmount,
          activatedAt: new Date(),
        });
      }
      return { success: true, levelId: level.id } as const;
    }),

    addPayment: protectedProcedure.input(z.object({
      levelId: z.number().int().positive(),
      direction: z.enum(["sent", "received"]),
      amount: z.number().int().positive().max(100000000),
      note: z.string().max(500).optional(),
      proofData: z.string().max(8000000).optional(),
      fileName: z.string().max(120).optional(),
      mimeType: z.string().max(80).optional(),
    })).mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "La base de datos no está disponible." });
      const level = (await db.select().from(cooperativeLevels).where(and(eq(cooperativeLevels.id, input.levelId), eq(cooperativeLevels.userId, ctx.user.id))).limit(1))[0];
      if (!level) throw new TRPCError({ code: "NOT_FOUND", message: "Nivel no encontrado." });

      let proofKey: string | undefined;
      let proofUrl: string | undefined;
      if (input.proofData) {
        const raw = input.proofData.includes(",") ? input.proofData.split(",")[1] : input.proofData;
        const extension = (input.fileName?.split(".").pop() || "jpg").replace(/[^a-z0-9]/gi, "").slice(0, 8) || "jpg";
        proofKey = `cooperative/${ctx.user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
        const uploaded = await storagePut(proofKey, Buffer.from(raw, "base64"), input.mimeType || "image/jpeg");
        proofUrl = uploaded.url;
      }

      await db.insert(cooperativePayments).values({
        levelId: input.levelId,
        senderUserId: input.direction === "sent" ? ctx.user.id : null,
        receiverUserId: input.direction === "received" ? ctx.user.id : null,
        direction: input.direction,
        amount: input.amount,
        status: "pending",
        proofKey,
        proofUrl,
        note: input.note,
      });
      return { success: true } as const;
    }),

    history: protectedProcedure.query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return [];
      return db.select().from(cooperativePayments).where(
        eq(cooperativePayments.senderUserId, ctx.user.id),
      ).orderBy(desc(cooperativePayments.createdAt));
    }),

    adminPayments: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { payments: [], profiles: [], levels: [], participants: [] };
      const [payments, profiles, levels, participants] = await Promise.all([
        db.select().from(cooperativePayments).orderBy(desc(cooperativePayments.createdAt)),
        db.select().from(cooperativeProfiles),
        db.select().from(cooperativeLevels),
        db.select().from(cooperativeParticipants),
      ]);
      return { payments, profiles, levels, participants };
    }),

    reviewPayment: adminProcedure.input(z.object({
      paymentId: z.number().int().positive(),
      status: z.enum(["verified", "rejected"]),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "La base de datos no está disponible." });
      const payment = (await db.select().from(cooperativePayments).where(eq(cooperativePayments.id, input.paymentId)).limit(1))[0];
      if (!payment) throw new TRPCError({ code: "NOT_FOUND", message: "Comprobante no encontrado." });
      await db.update(cooperativePayments).set({ status: input.status, reviewedAt: new Date() }).where(eq(cooperativePayments.id, input.paymentId));
      if (input.status === "verified" && payment.senderUserId) {
        await db.update(cooperativeParticipants).set({ status: "paid" }).where(and(eq(cooperativeParticipants.levelId, payment.levelId), eq(cooperativeParticipants.userId, payment.senderUserId)));
      }
      return { success: true, status: input.status } as const;
    }),

    adminOverview: adminProcedure.query(async () => {
      const db = await getDb();
      if (!db) return { users: [], profiles: [], levels: [], participants: [], payments: [], harvests: [] };
      const [allUsers, profiles, levels, participants, payments, harvests] = await Promise.all([
        db.select().from(users).orderBy(desc(users.createdAt)),
        db.select().from(cooperativeProfiles),
        db.select().from(cooperativeLevels),
        db.select().from(cooperativeParticipants),
        db.select().from(cooperativePayments).orderBy(desc(cooperativePayments.createdAt)),
        db.select().from(cooperativeHarvests).orderBy(desc(cooperativeHarvests.createdAt)),
      ]);
      return { users: allUsers, profiles, levels, participants, payments, harvests };
    }),

    setUserStatus: adminProcedure.input(z.object({
      userId: z.number().int().positive(),
      accountStatus: z.enum(["active", "inactive"]),
    })).mutation(async ({ ctx, input }) => {
      if (input.userId === ctx.user.id && input.accountStatus === "inactive") {
        throw new TRPCError({ code: "BAD_REQUEST", message: "No puedes desactivar tu propia cuenta administrativa." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "La base de datos no está disponible." });
      const target = (await db.select().from(users).where(eq(users.id, input.userId)).limit(1))[0];
      if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "Usuario no encontrado." });
      await db.update(users).set({ accountStatus: input.accountStatus }).where(eq(users.id, input.userId));
      return { success: true, accountStatus: input.accountStatus } as const;
    }),

    setParticipantStatus: adminProcedure.input(z.object({
      participantId: z.number().int().positive(),
      status: z.enum(["active", "withdrawn"]),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "La base de datos no está disponible." });
      const participant = (await db.select().from(cooperativeParticipants).where(eq(cooperativeParticipants.id, input.participantId)).limit(1))[0];
      if (!participant) throw new TRPCError({ code: "NOT_FOUND", message: "Participante no encontrado." });
      await db.update(cooperativeParticipants).set({ status: input.status }).where(eq(cooperativeParticipants.id, input.participantId));
      return { success: true, status: input.status } as const;
    }),

    createHarvest: adminProcedure.input(z.object({
      participantId: z.number().int().positive(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "La base de datos no está disponible." });
      const participant = (await db.select().from(cooperativeParticipants).where(eq(cooperativeParticipants.id, input.participantId)).limit(1))[0];
      if (!participant?.userId) throw new TRPCError({ code: "NOT_FOUND", message: "El participante no tiene un usuario asociado." });
      if (participant.position !== 12) throw new TRPCError({ code: "PRECONDITION_FAILED", message: "La cosecha solo se habilita al llegar a la posición 12." });
      const level = (await db.select().from(cooperativeLevels).where(eq(cooperativeLevels.id, participant.levelId)).limit(1))[0];
      if (!level) throw new TRPCError({ code: "NOT_FOUND", message: "Nivel no encontrado." });
      const existing = await db.select().from(cooperativeHarvests).where(eq(cooperativeHarvests.participantId, participant.id)).limit(1);
      if (existing.length) throw new TRPCError({ code: "CONFLICT", message: "La cosecha de este participante ya está registrada." });
      await db.insert(cooperativeHarvests).values({ levelId: level.id, participantId: participant.id, recipientUserId: participant.userId, amount: level.harvestAmount, status: "pending" });
      return { success: true, amount: level.harvestAmount } as const;
    }),

    payHarvest: adminProcedure.input(z.object({
      harvestId: z.number().int().positive(),
      paymentReference: z.string().min(2).max(120),
      note: z.string().max(500).optional(),
    })).mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "La base de datos no está disponible." });
      const harvest = (await db.select().from(cooperativeHarvests).where(eq(cooperativeHarvests.id, input.harvestId)).limit(1))[0];
      if (!harvest) throw new TRPCError({ code: "NOT_FOUND", message: "Pago de cosecha no encontrado." });
      if (harvest.status === "paid") throw new TRPCError({ code: "CONFLICT", message: "Este pago de cosecha ya fue marcado como realizado." });
      await db.update(cooperativeHarvests).set({ status: "paid", paymentReference: input.paymentReference, note: input.note, paidAt: new Date() }).where(eq(cooperativeHarvests.id, input.harvestId));
      await db.update(cooperativeParticipants).set({ status: "paid" }).where(eq(cooperativeParticipants.id, harvest.participantId));
      return { success: true } as const;
    }),
  }),
});

export type AppRouter = typeof appRouter;
