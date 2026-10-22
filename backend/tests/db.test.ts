import { describe, it, expect, afterAll } from "vitest";
import { prisma } from "../src/lib/prisma";

describe("Database Connectivity via Prisma Client", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("should successfully execute a raw query against Supabase PostgreSQL", async () => {
    const result = await prisma.$queryRaw<Array<{ ok: number }>>`SELECT 1 as ok`;
    expect(result).toBeDefined();
    expect(result.length).toBeGreaterThan(0);
    expect(Number(result[0].ok)).toBe(1);
  });

  it("should query the User and Loan tables without error", async () => {
    const userCount = await prisma.user.count();
    const loanCount = await prisma.loan.count();
    const challengeCount = await prisma.otpChallenge.count();

    expect(typeof userCount).toBe("number");
    expect(typeof loanCount).toBe("number");
    expect(typeof challengeCount).toBe("number");
  });
});
