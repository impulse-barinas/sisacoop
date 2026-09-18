import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: {
      id: 999999,
      openId: "validation-user",
      email: "validation@example.com",
      name: "Validation User",
      loginMethod: "test",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("cooperative input validation", () => {
  it("rejects level numbers outside the supported four levels", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.cooperative.activateLevel({ levelNumber: 5 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects incomplete participant profile data", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.cooperative.updateProfile({ fullName: "A" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("rejects zero or negative payment amounts before persistence", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.cooperative.addPayment({ levelId: 1, direction: "sent", amount: 0 })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("blocks the administrative payment inbox for regular users", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.cooperative.adminPayments()).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("validates administrative review status before touching the database", async () => {
    const context = createContext();
    context.user = { ...context.user!, role: "admin" };
    const caller = appRouter.createCaller(context);
    await expect(caller.cooperative.reviewPayment({ paymentId: 1, status: "pending" as "verified" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });
});
