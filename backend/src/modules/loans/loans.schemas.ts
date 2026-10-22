import { z } from "zod";

export const createLoanSchema = z.object({
  friendName: z
    .string({ required_error: "Friend name is required" })
    .trim()
    .min(1, "Friend name cannot be empty")
    .max(100, "Friend name cannot exceed 100 characters"),
  amount: z
    .union([z.string(), z.number()], { required_error: "Amount is required" })
    .transform((val) => String(val).trim())
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(val), {
      message: "Amount must be a positive number with at most 2 decimal places",
    })
    .refine((val) => Number(val) > 0, {
      message: "Amount must be greater than zero",
    }),
  dueDate: z
    .string({ required_error: "Due date is required" })
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Due date must be in YYYY-MM-DD format")
    .refine((val) => {
      const date = new Date(val);
      return !isNaN(date.getTime());
    }, {
      message: "Invalid calendar date",
    }),
});

export const loanIdParamSchema = z.object({
  id: z.string().uuid("Invalid loan ID format"),
});

export const listLoansQuerySchema = z.object({
  status: z.enum(["ALL", "PENDING", "REPAID", "OVERDUE"]).optional().default("ALL"),
});

export type CreateLoanInput = z.infer<typeof createLoanSchema>;
