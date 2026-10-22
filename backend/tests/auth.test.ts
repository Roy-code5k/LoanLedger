import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import bcrypt from "bcryptjs";
import express from "express";
import { createApp } from "../src/app";
import { prisma } from "../src/lib/prisma";
import { authenticateUser } from "../src/middleware/auth.middleware";
import { errorHandler } from "../src/middleware/error.middleware";

describe("Phase 3: Authentication API & Mock OTP", () => {
  const app = createApp();
  const testPhone = "+919876543210";
  const dummyPhone = "+919876543299";

  beforeAll(async () => {
    // Clean up test phone records
    await prisma.otpChallenge.deleteMany({ where: { phone: { in: [testPhone, dummyPhone] } } });
    await prisma.user.deleteMany({ where: { phone: { in: [testPhone, dummyPhone] } } });
  });

  afterAll(async () => {
    await prisma.otpChallenge.deleteMany({ where: { phone: { in: [testPhone, dummyPhone] } } });
    await prisma.user.deleteMany({ where: { phone: { in: [testPhone, dummyPhone] } } });
    await prisma.$disconnect();
  });

  describe("POST /api/auth/request-otp", () => {
    it("should reject an invalid phone number", async () => {
      const res = await request(app)
        .post("/api/auth/request-otp")
        .send({ phone: "123" });

      expect(res.status).toBe(400);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should generate a mock OTP, store hashed challenge, and never return OTP in response", async () => {
      const res = await request(app)
        .post("/api/auth/request-otp")
        .send({ phone: testPhone });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe("OTP generated. Check the backend terminal for this demo.");
      expect(res.body.otp).toBeUndefined(); // Security invariant: never expose OTP

      // Verify stored in DB with hash
      const challenge = await prisma.otpChallenge.findFirst({
        where: { phone: testPhone },
        orderBy: { createdAt: "desc" },
      });

      expect(challenge).toBeDefined();
      expect(challenge?.otpHash).toBeDefined();
      expect(challenge?.otpHash).not.toMatch(/^\d{6}$/); // Hash is bcrypt, not plaintext
      expect(challenge?.consumedAt).toBeNull();
    });
  });

  describe("POST /api/auth/verify-otp", () => {
    it("should reject invalid OTP length or format", async () => {
      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ phone: testPhone, otp: "12" });

      expect(res.status).toBe(400);
      expect(res.body.error.code).toBe("VALIDATION_ERROR");
    });

    it("should reject an incorrect OTP", async () => {
      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ phone: testPhone, otp: "000000" });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("INVALID_OTP");
    });

    it("should reject an expired OTP challenge", async () => {
      // Create an expired challenge
      const salt = await bcrypt.genSalt(10);
      const otpHash = await bcrypt.hash("555555", salt);

      await prisma.otpChallenge.create({
        data: {
          phone: dummyPhone,
          otpHash,
          expiresAt: new Date(Date.now() - 1000 * 60), // 1 minute in the past
        },
      });

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ phone: dummyPhone, otp: "555555" });

      expect(res.status).toBe(401);
      expect(res.body.error.code).toBe("EXPIRED_OTP");
    });

    it("should verify valid OTP, consume challenge, create User, and issue JWT", async () => {
      // Seed a known OTP
      const knownOtp = "654321";
      const salt = await bcrypt.genSalt(10);
      const otpHash = await bcrypt.hash(knownOtp, salt);

      await prisma.otpChallenge.create({
        data: {
          phone: testPhone,
          otpHash,
          expiresAt: new Date(Date.now() + 1000 * 60 * 5),
        },
      });

      const res = await request(app)
        .post("/api/auth/verify-otp")
        .send({ phone: testPhone, otp: knownOtp });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("token");
      expect(res.body).toHaveProperty("user");
      expect(res.body.user.phone).toBe(testPhone);
      expect(res.body.user.id).toBeDefined();

      // Verify challenge is marked consumed
      const latest = await prisma.otpChallenge.findFirst({
        where: { phone: testPhone },
        orderBy: { createdAt: "desc" },
      });
      expect(latest?.consumedAt).not.toBeNull();

      // Test Single-Use (Replay attack prevention)
      const replayRes = await request(app)
        .post("/api/auth/verify-otp")
        .send({ phone: testPhone, otp: knownOtp });

      expect(replayRes.status).toBe(401); // No active unconsumed challenge found
    });
  });

  describe("Authentication Middleware", () => {
    it("should reject protected route requests when Authorization header is missing", async () => {
      // Test app with a dummy protected route and error handler attached last
      const testProtectedApp = express();
      testProtectedApp.use(express.json());
      testProtectedApp.get("/api/test-protected", authenticateUser, (req, res) => {
        res.json({ userId: req.user?.id });
      });
      testProtectedApp.use(errorHandler);

      const res = await request(testProtectedApp).get("/api/test-protected");
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
      expect(res.body.error.code).toBe("UNAUTHORIZED");
    });

    it("should allow access and extract user scope when valid JWT is provided", async () => {
      // First get a valid token
      const knownOtp = "112233";
      const salt = await bcrypt.genSalt(10);
      const otpHash = await bcrypt.hash(knownOtp, salt);

      await prisma.otpChallenge.create({
        data: {
          phone: testPhone,
          otpHash,
          expiresAt: new Date(Date.now() + 1000 * 60 * 5),
        },
      });

      const loginRes = await request(app)
        .post("/api/auth/verify-otp")
        .send({ phone: testPhone, otp: knownOtp });

      const token = loginRes.body.token;

      // Access protected endpoint
      const testProtectedApp = createApp();
      testProtectedApp.get("/api/test-protected", authenticateUser, (req, res) => {
        res.json({ userId: req.user?.id, phone: req.user?.phone });
      });

      const res = await request(testProtectedApp)
        .get("/api/test-protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.userId).toBe(loginRes.body.user.id);
      expect(res.body.phone).toBe(testPhone);
    });
  });
});
