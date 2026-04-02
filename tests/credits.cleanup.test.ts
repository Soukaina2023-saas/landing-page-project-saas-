import { describe, it, expect, vi, beforeEach } from "vitest";

const findMany = vi.fn();
const rollbackCredits = vi.fn();

vi.mock("../lib/credits/credits.repository.js", () => ({
  prisma: {
    creditReservation: {
      findMany,
    },
  },
}));

vi.mock("../lib/credits/credits.service.js", () => ({
  rollbackCredits,
}));

describe("cleanupExpiredReservations", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("returns zeros when nothing expired", async () => {
    findMany.mockResolvedValue([]);
    const { cleanupExpiredReservations } = await import(
      "../lib/credits/credits.cleanup.js"
    );
    const result = await cleanupExpiredReservations();
    expect(result).toEqual({
      scanned: 0,
      released: 0,
      failed: 0,
      failures: [],
    });
    expect(rollbackCredits).not.toHaveBeenCalled();
  });

  it("calls rollbackCredits per expired row", async () => {
    findMany.mockResolvedValue([
      {
        id: "r1",
        userId: "u1",
        amount: 10,
        expiresAt: new Date("2020-01-01"),
      },
      {
        id: "r2",
        userId: "u1",
        amount: 5,
        expiresAt: new Date("2020-01-02"),
      },
    ]);
    rollbackCredits.mockResolvedValue(undefined);

    const { cleanupExpiredReservations } = await import(
      "../lib/credits/credits.cleanup.js"
    );
    const result = await cleanupExpiredReservations();

    expect(findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          status: "PENDING",
          expiresAt: { lt: expect.any(Date) },
        },
      })
    );
    expect(rollbackCredits).toHaveBeenCalledTimes(2);
    expect(rollbackCredits).toHaveBeenNthCalledWith(1, "r1");
    expect(rollbackCredits).toHaveBeenNthCalledWith(2, "r2");
    expect(result).toMatchObject({
      scanned: 2,
      released: 2,
      failed: 0,
      failures: [],
    });
  });

  it("records failures and continues", async () => {
    findMany.mockResolvedValue([
      {
        id: "r1",
        userId: "u1",
        amount: 10,
        expiresAt: new Date("2020-01-01"),
      },
      {
        id: "r2",
        userId: "u1",
        amount: 5,
        expiresAt: new Date("2020-01-02"),
      },
    ]);
    rollbackCredits
      .mockRejectedValueOnce(new Error("db down"))
      .mockResolvedValueOnce(undefined);

    const { cleanupExpiredReservations } = await import(
      "../lib/credits/credits.cleanup.js"
    );
    const result = await cleanupExpiredReservations();

    expect(result.scanned).toBe(2);
    expect(result.released).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.failures).toHaveLength(1);
    expect(result.failures[0].reservationId).toBe("r1");
  });
});
