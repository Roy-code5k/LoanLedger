import { Router } from "express";
import rateLimit from "express-rate-limit";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validate.middleware";
import { requestOtpSchema, verifyOtpSchema } from "./auth.schemas";

export const authRouter = Router();

// Rate limiter for OTP requests: max 5 requests per 5 minutes per IP
const otpRequestLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many OTP requests. Please wait a few minutes before trying again.",
    },
  },
});

// Rate limiter for verification: max 10 attempts per 5 minutes per IP
const otpVerifyLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many verification attempts. Please wait a few minutes before trying again.",
    },
  },
});

authRouter.post(
  "/request-otp",
  otpRequestLimiter,
  validateRequest(requestOtpSchema),
  AuthController.requestOtp
);

authRouter.post(
  "/verify-otp",
  otpVerifyLimiter,
  validateRequest(verifyOtpSchema),
  AuthController.verifyOtp
);
