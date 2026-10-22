import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";
import { config } from "../src/config/env";

describe("Phase 4: Loans and Summary Backend", () => {
  const app = createApp();

  let userA: { id: string; phone: string; token: string };
  let userB: { id: string; phone: string; token: string };

  const todayStr = new Date().toISOString().split("T")[0];
  const pastDateStr = "2024-01-01";
  const futureDateStr = "2028-12-31";

  beforeAll(async () => {
    // Clean up test data
    const phones = ["+919999900001", "+919999900002"];
    await prisma.loan.deleteMany({
      where: { user: { phone: { in: phones } } },
    });
    await prisma.user.deleteMany({
      where: { phone: { in: phones } },
    });

    // Create User A
    const dbUserA = await prisma.user.create({
      data: { phone: "+919999900001" },
    });
    const tokenA = jwt.sign({ sub: dbUserA.id, phone: dbUserA.phone }, config.jwtSecret);
    userA = { id: dbUserA.id, phone: dbUserA.phone, token: tokenA };

    // Create User B
    const dbUserB = await prisma.user.create({
      data: { phone: "+919999900002" },
    });
    const tokenB = jwt.sign({ sub: dbUserB.id, phone: dbUserB.phone }, config.jwtSecret);
    userB = { id: dbUserB.id, phone: dbUserB.phone, token: tokenB };
  });

  afterAll(async () => {
    const phones = ["+919999900001", "+919999900002"];
    await prisma.loan.deleteMany({
      where: { user: { phone: { in: phones } } },
    });
    await prisma.user.deleteMany({
      where: { phone: { in: phones } },
    });
    await prisma.$disconnect();
  });

  describe("POST /api/loans (Create Loan)", () => {
    it("should reject creation if unauthenticated", async () => {
      const res = await request(app).post("/api/loans").send({
        friendName: "Rahul",
        amount: "500.00",
        dueDate: futureDateStr,
      });
      expect(res.status).toBe(401);
    });

    it("should reject invalid loan inputs", async () => {
      // Empty friend name
      const res1 = await request(app)
        .post("/api/loans")
        .set("Authorization", `Bearer ${userA.token}`)
        .send({ friendName: "   ", amount: "500.00", dueDate: futureDateStr });
      expect(res1.status).toBe(400);

      // Negative amount
      const res2 = await request(app)
        .post("/api/loans")
        .set("Authorization", `Bearer ${userA.token}`)
        .send({ friendName: "Rahul", amount: "-100", dueDate: futureDateStr });
      expect(res2.status).toBe(400);

      // Invalid date
      const res3 = await request(app)
        .post("/api/loans")
        .set("Authorization", `Bearer ${userA.token}`)
        .send({ friendName: "Rahul", amount: "100", dueDate: "invalid-date" });
      expect(res3.status).toBe(400);
    });

    it("should successfully create a loan for authenticated user", async () => {
      const res = await request(app)
        .post("/api/loans")
        .set("Authorization", `Bearer ${userA.token}`)
        .send({
          friendName: "Priya",
          amount: "1500.50",
          dueDate: futureDateStr,
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.friendName).toBe("Priya");
      expect(res.body.amount).toBe("1500.50");
      expect(res.body.status).toBe("PENDING");
      expect(res.body.isOverdue).toBe(false);
      expect(res.body.userId).toBe(userA.id);
    });
  });

  describe("GET /api/loans (List Loans & User Scoping)", () => {
    it("should isolate loans by authenticated user", async () => {
      // Create a loan for User B
      await request(app)
        .post("/api/loans")
        .set("Authorization", `Bearer ${userB.token}`)
        .send({
          friendName: "UserB Friend",
          amount: "2000.00",
          dueDate: futureDateStr,
        });

      // User A fetches their loans
      const resA = await request(app)
        .get("/api/loans")
        .set("Authorization", `Bearer ${userA.token}`);

      expect(resA.status).toBe(200);
      expect(Array.isArray(resA.body)).toBe(true);
      // All loans must belong to User A only
      expect(resA.body.every((l: any) => l.userId === userA.id)).toBe(true);
      expect(resA.body.some((l: any) => l.friendName === "UserB Friend")).toBe(false);
    });
  });

  describe("PATCH /api/loans/:id/repay (Repay Loan)", () => {
    let loanToRepayId: string;

    beforeAll(async () => {
      const createRes = await request(app)
        .post("/api/loans")
        .set("Authorization", `Bearer ${userA.token}`)
        .send({
          friendName: "Vikram",
          amount: "800.00",
          dueDate: futureDateStr,
        });
      loanToRepayId = createRes.body.id;
    });

    it("should prevent User B from repaying User A's loan", async () => {
      const res = await request(app)
        .patch(`/api/loans/${loanToRepayId}/repay`)
        .set("Authorization", `Bearer ${userB.token}`);

      expect(res.status).toBe(404);
      expect(res.body.error.code).toBe("RESOURCE_NOT_FOUND");
    });

    it("should allow User A to mark their loan as repaid", async () => {
      const res = await request(app)
        .patch(`/api/loans/${loanToRepayId}/repay`)
        .set("Authorization", `Bearer ${userA.token}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("REPAID");
      expect(res.body.repaidAt).not.toBeNull();
    });

    it("should reject repaying an already repaid loan with 409 Conflict", async () => {
      const res = await request(app)
        .patch(`/api/loans/${loanToRepayId}/repay`)
        .set("Authorization", `Bearer ${userA.token}`);

      expect(res.status).toBe(409);
      expect(res.body.error.code).toBe("ALREADY_REPAID");
    });
  });

  describe("GET /api/summary (Financial Calculations & Overdue Rules)", () => {
    let userSummary: { id: string; token: string };

    beforeAll(async () => {
      // Dedicated user for summary testing
      const dbUser = await prisma.user.create({
        data: { phone: "+919999900003" },
      });
      userSummary = {
        id: dbUser.id,
        token: jwt.sign({ sub: dbUser.id, phone: dbUser.phone }, config.jwtSecret),
      };
    });

    afterAll(async () => {
      await prisma.loan.deleteMany({ where: { userId: userSummary.id } });
      await prisma.user.deleteMany({ where: { id: userSummary.id } });
    });

    it("should return 0.00 values for a user with no loans", async () => {
      const res = await request(app)
        .get("/api/summary")
        .set("Authorization", `Bearer ${userSummary.token}`);

      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        totalLent: "0.00",
        totalRepaid: "0.00",
        overdueAmount: "0.00",
        currency: "INR",
      });
    });

    it("should accurately compute totalLent, totalRepaid, and overdueAmount according to business rules", async () => {
      // 1. Pending loan due in the FUTURE: 1000.00 (not overdue)
      await request(app)
        .post("/api/loans")
        .set("Authorization", `Bearer ${userSummary.token}`)
        .send({ friendName: "Future Loan", amount: "1000.00", dueDate: futureDateStr });

      // 2. Pending loan due TODAY: 500.00 (Rule: due today is NOT overdue)
      await request(app)
        .post("/api/loans")
        .set("Authorization", `Bearer ${userSummary.token}`)
        .send({ friendName: "Today Loan", amount: "500.00", dueDate: todayStr });

      // 3. Pending loan due in the PAST: 700.00 (OVERDUE)
      await request(app)
        .post("/api/loans")
        .set("Authorization", `Bearer ${userSummary.token}`)
        .send({ friendName: "Past Overdue Loan", amount: "700.00", dueDate: pastDateStr });

      // 4. Loan due in the past but REPAID: 300.00 (Rule: repaid is NEVER overdue)
      const repaidPastRes = await request(app)
        .post("/api/loans")
        .set("Authorization", `Bearer ${userSummary.token}`)
        .send({ friendName: "Past Repaid Loan", amount: "300.00", dueDate: pastDateStr });
      await request(app)
        .patch(`/api/loans/${repaidPastRes.body.id}/repay`)
        .set("Authorization", `Bearer ${userSummary.token}`);

      // Expected aggregates:
      // Total Lent: 1000 + 500 + 700 + 300 = 2500.00
      // Total Repaid: 300.00
      // Overdue Amount: 700.00 (only the pending past loan)
      const res = await request(app)
        .get("/api/summary")
        .set("Authorization", `Bearer ${userSummary.token}`);

      expect(res.status).toBe(200);
      expect(res.body.totalLent).toBe("2500.00");
      expect(res.body.totalRepaid).toBe("300.00");
      expect(res.body.overdueAmount).toBe("700.00");
      expect(res.body.currency).toBe("INR");
    });
  });
});
