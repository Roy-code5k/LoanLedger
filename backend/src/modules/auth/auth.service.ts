import crypto from "crypto";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../../lib/prisma";
import { config } from "../../config/env";
import { AppError } from "../../middleware/error.middleware";

export class AuthService {
  /**
   * Generates a random 6-digit OTP, stores its hash with a 5-minute expiry,
   * and prints the mock OTP to the backend terminal ONLY.
   */
  static async requestOtp(phone: string): Promise<{ message: string }> {
    // Generate secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash the OTP with bcrypt (salt rounds: 10)
    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store in database
    await prisma.otpChallenge.create({
      data: {
        phone,
        otpHash,
        expiresAt,
      },
    });

    // Output strictly to backend terminal only
    console.log(`\n======================================================`);
    console.log(`[DEMO AUTH] Mock OTP for ${phone}: ${otp}`);
    console.log(`Expires at: ${expiresAt.toLocaleTimeString()}`);
    console.log(`======================================================\n`);

    return {
      message: "OTP generated. Check the backend terminal for this demo.",
    };
  }

  /**
   * Verifies the submitted OTP against the latest active challenge for the phone.
   * If valid, consumes the challenge, creates/finds the user, and returns a signed JWT.
   */
  static async verifyOtp(
    phone: string,
    otp: string
  ): Promise<{ token: string; user: { id: string; phone: string } }> {
    // Find latest eligible challenge
    const latestChallenge = await prisma.otpChallenge.findFirst({
      where: {
        phone,
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!latestChallenge) {
      throw new AppError("No active OTP request found for this phone number.", 401, "INVALID_OTP");
    }

    // Check expiry
    if (new Date() > latestChallenge.expiresAt) {
      throw new AppError("OTP has expired. Please request a new OTP.", 401, "EXPIRED_OTP");
    }

    // Verify hash
    const isValid = await bcrypt.compare(otp, latestChallenge.otpHash);
    if (!isValid) {
      throw new AppError("Invalid OTP. Please check the backend terminal and try again.", 401, "INVALID_OTP");
    }

    // Atomically consume challenge and find or create user inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Ensure challenge hasn't been consumed concurrently
      const current = await tx.otpChallenge.findUnique({
        where: { id: latestChallenge.id },
      });

      if (!current || current.consumedAt !== null) {
        throw new AppError("This OTP has already been used.", 409, "OTP_ALREADY_USED");
      }

      // Mark consumed
      await tx.otpChallenge.update({
        where: { id: latestChallenge.id },
        data: { consumedAt: new Date() },
      });

      // Find or create User
      const user = await tx.user.upsert({
        where: { phone },
        update: {},
        create: { phone },
      });

      return user;
    });

    // Issue JWT
    const token = jwt.sign(
      {
        sub: result.id,
        phone: result.phone,
      },
      config.jwtSecret,
      {
        expiresIn: config.jwtExpiresIn as any,
      }
    );

    return {
      token,
      user: {
        id: result.id,
        phone: result.phone,
      },
    };
  }
}
