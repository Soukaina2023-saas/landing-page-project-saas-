import { describe, it, expect, vi, beforeEach } from "vitest";

const tx = {
  creditLedgerEntry: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  creditBalance: {
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  creditReservation: {
    create: vi.fn(),
    findUnique: vi.fn(),
    update: vi.fn(),
  },
};

const prismaMock = {
  $transaction: vi.fn(async (fn: any) => fn(tx)),
};

vi.mock("../lib/credits/credits.repository.js", () => ({
  prisma: prismaMock,
  getBalance: vi.fn(),
  getBalanceForUpdate: vi.fn(),
  createReservation: vi.fn(),
  getReservationForUpdate: vi.fn(),
  settleReservation: vi.fn(),
  upsertBalance: vi.fn(),
}));

describe("credits.service", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    tx.creditLedgerEntry.findUnique.mockResolvedValue(null);
    tx.creditLedgerEntry.create.mockResolvedValue({ id: "le1" });
  });

  it("reserve → success", async () => {
    const repo = await import("../lib/credits/credits.repository.js");
    vi.mocked(repo.getBalanceForUpdate).mockResolvedValue({ credits: 100 } as any);
    vi.mocked(repo.createReservation).mockResolvedValue({ id: "r1" } as any);
    vi.mocked(repo.upsertBalance).mockResolvedValue({ credits: 90 } as any);

    const { reserveCredits } = await import("../lib/credits/credits.service.js");
    const res = await reserveCredits("u1", 10, "idem1");
    expect(res).toEqual({ reservationId: "r1" });
    expect(tx.creditLedgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          userId: "u1",
          direction: "DEBIT",
          amount: 10,
          reason: "reservation_hold",
          reservationId: "r1",
          idempotencyKey: "reserve:idem1",
        }),
      })
    );
  });

  it("reserve → insufficient balance", async () => {
    const repo = await import("../lib/credits/credits.repository.js");
    vi.mocked(repo.getBalanceForUpdate).mockResolvedValue({ credits: 5 } as any);

    const { reserveCredits } = await import("../lib/credits/credits.service.js");
    await expect(reserveCredits("u1", 10, "idem1")).rejects.toMatchObject({
      name: "InsufficientCreditsError",
    });
  });

  it("finalize → success", async () => {
    const repo = await import("../lib/credits/credits.repository.js");
    vi.mocked(repo.getReservationForUpdate).mockResolvedValue({
      id: "r1",
      userId: "u1",
      status: "PENDING",
    } as any);

    const { finalizeCredits } = await import("../lib/credits/credits.service.js");
    await finalizeCredits("r1", "gr1");
    expect(vi.mocked(repo.settleReservation)).toHaveBeenCalledWith(
      expect.anything(),
      "r1",
      "FINALIZED"
    );
    expect(tx.creditLedgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reason: "reservation_finalize",
          amount: 0,
          reservationId: "r1",
          generationRequestId: "gr1",
          idempotencyKey: "finalize:r1",
        }),
      })
    );
  });

  it("rollback → restores balance", async () => {
    const repo = await import("../lib/credits/credits.repository.js");
    vi.mocked(repo.getReservationForUpdate).mockResolvedValue({
      id: "r1",
      userId: "u1",
      status: "PENDING",
      amount: 10,
    } as any);

    const { rollbackCredits } = await import("../lib/credits/credits.service.js");
    await rollbackCredits("r1");
    expect(vi.mocked(repo.settleReservation)).toHaveBeenCalledWith(
      expect.anything(),
      "r1",
      "ROLLED_BACK"
    );
    expect(vi.mocked(repo.upsertBalance)).toHaveBeenCalledWith(
      expect.anything(),
      "u1",
      10
    );
    expect(tx.creditLedgerEntry.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          reason: "reservation_rollback",
          direction: "CREDIT",
          amount: 10,
          reservationId: "r1",
          idempotencyKey: "rollback:r1",
        }),
      })
    );
  });

  it("idempotency → no duplication on reserve", async () => {
    tx.creditLedgerEntry.findUnique.mockResolvedValue({ reservationId: "r1" });
    const { reserveCredits } = await import("../lib/credits/credits.service.js");
    const res = await reserveCredits("u1", 10, "idem1");
    expect(res).toEqual({ reservationId: "r1" });
    expect(tx.creditLedgerEntry.create).not.toHaveBeenCalled();
  });
});

