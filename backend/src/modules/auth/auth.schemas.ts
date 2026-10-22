import { z } from "zod";

/**
 * Normalizes phone numbers:
 * - Trims whitespace
 * - Removes dashes, spaces, and parentheses
 * - If 10 digits are provided, prepends +91
 * - Otherwise ensures it begins with a '+' followed by 10-15 digits
 */
export const normalizePhone = (phone: string): string => {
  const cleaned = phone.replace(/[\s\-\(\)]/g, "").trim();
  if (/^\d{10}$/.test(cleaned)) {
    return `+91${cleaned}`;
  }
  if (/^91\d{10}$/.test(cleaned)) {
    return `+${cleaned}`;
  }
  if (!cleaned.startsWith("+")) {
    return `+${cleaned}`;
  }
  return cleaned;
};

export const requestOtpSchema = z.object({
  phone: z
    .string({ required_error: "Phone number is required" })
    .min(10, "Phone number is too short")
    .max(20, "Phone number is too long")
    .transform((val) => normalizePhone(val))
    .refine((val) => /^\+[1-9]\d{9,14}$/.test(val), {
      message: "Please enter a valid phone number with country code (e.g. +919876543210)",
    }),
});

export const verifyOtpSchema = z.object({
  phone: z
    .string({ required_error: "Phone number is required" })
    .transform((val) => normalizePhone(val))
    .refine((val) => /^\+[1-9]\d{9,14}$/.test(val), {
      message: "Invalid phone number format",
    }),
  otp: z
    .string({ required_error: "OTP is required" })
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d{6}$/, "OTP must consist of digits only"),
});

export type RequestOtpInput = z.infer<typeof requestOtpSchema>;
export type VerifyOtpInput = z.infer<typeof verifyOtpSchema>;
